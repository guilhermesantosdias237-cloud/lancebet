"""
Rotas do módulo de eventos esportivos do LanceBet (API JSON).

Dois routers são exportados:

- ``router`` (prefixo ``/eventos``): consulta PÚBLICA (anônimo permitido).
    - GET ""        -> lista paginada de eventos (exclui LIQUIDADO por padrão)
    - GET "/{id}"   -> detalhe do evento com opções

- ``admin_router`` (prefixo ``/admin/eventos``): gestão (perfil Administrador).
    - POST  ""                  -> cria evento + 3 opções (Mandante/Empate/Visitante)
    - GET   ""                  -> lista todos os eventos (inclui LIQUIDADO) + contadores
    - PUT   "/{id}"             -> edita dados básicos do evento
    - PATCH "/{id}/status"      -> alterna Aberto/Fechado
    - GET   "/{id}/opcoes"      -> lista opções do evento
    - POST  "/{id}/opcoes"      -> adiciona opção
    - PATCH "/opcoes/{id}/odd"  -> atualiza odd da opção
    - PATCH "/opcoes/{id}/status" -> suspende/reativa opção

A liquidação de evento (POST /admin/eventos/{id}/liquidar) NÃO está aqui:
ela depende do módulo de apostas/carteira e vive no módulo de apostas
(processa créditos e movimentações financeiras na liquidação).

NOTA sobre contadores admin (total_apostas/volume_apostado): são obtidos via
lazy import de ``repo.aposta_repo`` quando esse módulo existir; se ainda não
existir (este módulo é entregue antes), os contadores ficam em 0 — o módulo
importa e funciona de forma independente.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from dtos.evento_dto import (
    CriarEventoDTO,
    AtualizarEventoDTO,
    AlterarStatusEventoDTO,
    AdicionarOpcaoDTO,
    AtualizarOddDTO,
    AlterarStatusOpcaoDTO,
)
from dtos.responses.evento_response import (
    EventoResponse,
    EventoAdminResponse,
    OpcaoApostaResponse,
)
from dtos.responses.comum import PaginaResponse

from model.evento_model import (
    EventoEsportivo,
    OpcaoAposta,
    StatusEvento,
    StatusOpcao,
)
from model.usuario_logado_model import UsuarioLogado

from repo import evento_repo

from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.paginacao_util import paginar
from util.perfis import Perfil

# =============================================================================
# Routers
# =============================================================================

router = APIRouter(prefix="/eventos")
admin_router = APIRouter(prefix="/admin/eventos")
# Opções de aposta são manipuladas por id direto (contrato:
# PATCH /admin/opcoes/{id}/odd e /admin/opcoes/{id}/status).
admin_opcoes_router = APIRouter(prefix="/admin/opcoes")


# =============================================================================
# Helpers
# =============================================================================

def _contadores_evento(evento_id: int) -> tuple[int, float]:
    """Retorna (total_apostas, volume_apostado) para um evento.

    Usa lazy import do repo de apostas. Se o módulo ainda não existir,
    retorna (0, 0.0) para manter este módulo independente.
    """
    try:
        from repo import aposta_repo  # type: ignore
    except Exception:
        return (0, 0.0)
    try:
        return (
            aposta_repo.contar_por_evento(evento_id),
            aposta_repo.volume_por_evento(evento_id),
        )
    except AttributeError:
        return (0, 0.0)


def _obter_evento_ou_404(id: int) -> EventoEsportivo:
    evento = evento_repo.obter_por_id(id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )
    return evento


def _obter_opcao_ou_404(id: int) -> OpcaoAposta:
    opcao = evento_repo.obter_opcao_por_id(id)
    if not opcao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opção de aposta não encontrada.",
        )
    return opcao


def _impedir_se_liquidado(evento: EventoEsportivo) -> None:
    if evento.status == StatusEvento.LIQUIDADO:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Evento já liquidado não pode ser alterado.",
        )


# =============================================================================
# Rotas públicas (anônimo permitido)
# =============================================================================

@router.get("", response_model=PaginaResponse[EventoResponse])
async def listar_eventos(
    request: Request,
    status_filtro: Optional[str] = None,
    esporte: Optional[str] = None,
    pagina: int = 1,
    por_pagina: int = 20,
):
    """Lista eventos públicos (exclui LIQUIDADO quando ``status`` não informado).

    O query param do filtro de status chama-se ``status`` no contrato HTTP,
    mas é exposto aqui como ``status_filtro`` (alias) para não colidir com o
    módulo ``fastapi.status``.
    """
    eventos = evento_repo.listar(
        status=status_filtro,
        esporte=esporte,
        excluir_liquidados=status_filtro is None,
    )
    paginacao = paginar(eventos, pagina, por_pagina)
    return PaginaResponse.de_paginacao(
        paginacao,
        [EventoResponse.de_evento(e) for e in paginacao.items],
    )


@router.get("/{id}", response_model=EventoResponse)
async def obter_evento(request: Request, id: int):
    """Detalhe de um evento com todas as opções de aposta (anônimo permitido)."""
    evento = _obter_evento_ou_404(id)
    return EventoResponse.de_evento(evento)


# =============================================================================
# Rotas admin — eventos
# =============================================================================

@admin_router.post(
    "",
    response_model=EventoResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao([Perfil.ADMIN.value])
async def criar_evento(
    request: Request,
    dto: CriarEventoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria um evento esportivo já com 3 opções (Mandante/Empate/Visitante)."""
    assert usuario_logado is not None

    evento = EventoEsportivo(
        id=0,
        mandante=dto.mandante,
        visitante=dto.visitante,
        titulo=f"{dto.mandante} x {dto.visitante}",
        esporte="Futebol",
        competicao=dto.competicao,
        data_hora=dto.data_hora,
        status=StatusEvento.ABERTO,
        resultado_descricao="",
        criado_por=usuario_logado.id,
        opcoes=[
            OpcaoAposta(
                id=0, evento_id=0, descricao=dto.mandante, sub="Mandante",
                odd=dto.odd_mandante, status=StatusOpcao.ATIVA, vencedora=False,
            ),
            OpcaoAposta(
                id=0, evento_id=0, descricao="Empate", sub="Empate",
                odd=dto.odd_empate, status=StatusOpcao.ATIVA, vencedora=False,
            ),
            OpcaoAposta(
                id=0, evento_id=0, descricao=dto.visitante, sub="Visitante",
                odd=dto.odd_visitante, status=StatusOpcao.ATIVA, vencedora=False,
            ),
        ],
    )

    evento_id = evento_repo.criar(evento)
    if not evento_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar o evento. Tente novamente.",
        )

    logger.info(
        f"Evento #{evento_id} '{evento.titulo}' criado por admin {usuario_logado.id}"
    )
    criado = _obter_evento_ou_404(evento_id)
    return EventoResponse.de_evento(criado)


@admin_router.get("", response_model=PaginaResponse[EventoAdminResponse])
@requer_autenticacao([Perfil.ADMIN.value])
async def listar_eventos_admin(
    request: Request,
    status_filtro: Optional[str] = None,
    esporte: Optional[str] = None,
    pagina: int = 1,
    por_pagina: int = 20,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todos os eventos (inclui LIQUIDADO) com contadores por evento."""
    assert usuario_logado is not None
    eventos = evento_repo.listar(status=status_filtro, esporte=esporte)
    paginacao = paginar(eventos, pagina, por_pagina)

    items = []
    for e in paginacao.items:
        total_apostas, volume = _contadores_evento(e.id)
        items.append(
            EventoAdminResponse.de_evento_admin(e, total_apostas, volume)
        )
    return PaginaResponse.de_paginacao(paginacao, items)


@admin_router.put("/{id}", response_model=EventoResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def atualizar_evento(
    request: Request,
    id: int,
    dto: AtualizarEventoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza dados básicos do evento (não altera status nem opções)."""
    assert usuario_logado is not None
    evento = _obter_evento_ou_404(id)
    _impedir_se_liquidado(evento)

    evento.mandante = dto.mandante
    evento.visitante = dto.visitante
    evento.competicao = dto.competicao
    evento.data_hora = dto.data_hora
    evento.esporte = dto.esporte
    evento_repo.atualizar(evento)

    atualizado = _obter_evento_ou_404(id)
    return EventoResponse.de_evento(atualizado)


@admin_router.patch("/{id}/status", response_model=EventoResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def alterar_status_evento(
    request: Request,
    id: int,
    dto: AlterarStatusEventoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Alterna o status do evento entre 'Aberto' e 'Fechado'."""
    assert usuario_logado is not None
    evento = _obter_evento_ou_404(id)
    _impedir_se_liquidado(evento)

    evento_repo.definir_status(id, dto.status)
    logger.info(
        f"Status do evento #{id} alterado para '{dto.status}' "
        f"por admin {usuario_logado.id}"
    )
    atualizado = _obter_evento_ou_404(id)
    return EventoResponse.de_evento(atualizado)


# =============================================================================
# Rotas admin — opções de aposta
# =============================================================================

@admin_router.get("/{id}/opcoes", response_model=list[OpcaoApostaResponse])
@requer_autenticacao([Perfil.ADMIN.value])
async def listar_opcoes(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todas as opções de aposta de um evento."""
    assert usuario_logado is not None
    _obter_evento_ou_404(id)
    opcoes = evento_repo.listar_opcoes_por_evento(id)
    return [OpcaoApostaResponse.de_opcao(o) for o in opcoes]


@admin_router.post(
    "/{id}/opcoes",
    response_model=OpcaoApostaResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao([Perfil.ADMIN.value])
async def adicionar_opcao(
    request: Request,
    id: int,
    dto: AdicionarOpcaoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Adiciona uma nova opção de aposta a um evento (exceto se liquidado)."""
    assert usuario_logado is not None
    evento = _obter_evento_ou_404(id)
    _impedir_se_liquidado(evento)

    opcao = OpcaoAposta(
        id=0,
        evento_id=id,
        descricao=dto.descricao,
        sub=dto.sub,
        odd=dto.odd,
        status=StatusOpcao.ATIVA,
        vencedora=False,
    )
    opcao_id = evento_repo.criar_opcao(opcao)
    if not opcao_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao adicionar a opção. Tente novamente.",
        )
    criada = _obter_opcao_ou_404(opcao_id)
    return OpcaoApostaResponse.de_opcao(criada)


@admin_opcoes_router.patch("/{id}/odd", response_model=OpcaoApostaResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def atualizar_odd(
    request: Request,
    id: int,
    dto: AtualizarOddDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza a odd de uma opção (não afeta apostas já registradas)."""
    assert usuario_logado is not None
    opcao = _obter_opcao_ou_404(id)
    evento = _obter_evento_ou_404(opcao.evento_id)
    _impedir_se_liquidado(evento)

    evento_repo.atualizar_odd(id, dto.odd)
    atualizada = _obter_opcao_ou_404(id)
    return OpcaoApostaResponse.de_opcao(atualizada)


@admin_opcoes_router.patch("/{id}/status", response_model=OpcaoApostaResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def alterar_status_opcao(
    request: Request,
    id: int,
    dto: AlterarStatusOpcaoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Suspende ou reativa uma opção de aposta (exceto se evento liquidado)."""
    assert usuario_logado is not None
    opcao = _obter_opcao_ou_404(id)
    evento = _obter_evento_ou_404(opcao.evento_id)
    _impedir_se_liquidado(evento)

    evento_repo.alternar_status(id, dto.status)
    atualizada = _obter_opcao_ou_404(id)
    return OpcaoApostaResponse.de_opcao(atualizada)
