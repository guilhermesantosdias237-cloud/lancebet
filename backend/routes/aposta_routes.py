"""Rotas do módulo de apostas (LanceBet) — API JSON.

Expõe três routers (todos montados sob /api pela integração em main.py):

- ``router``               -> /apostas        (apostador): criar, listar minhas
- ``admin_router``         -> /admin/apostas  (admin): listar todas
- ``admin_liquidacao_router`` -> /admin/eventos (admin): liquidar evento

A liquidação fica neste módulo porque sua lógica vive em ``aposta_repo`` (toca
apostas, carteira e movimentações numa única transação atômica). O path segue o
contrato canônico: POST /admin/eventos/{id}/liquidar.
"""

# =============================================================================
# Imports
# =============================================================================

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from dtos.aposta_dto import CriarApostaDTO, LiquidarEventoDTO
from dtos.responses.aposta_response import (
    ApostaResponse,
    ApostaComSaldoResponse,
    ApostaAdminResponse,
    LiquidacaoResponse,
    AdminDashboardResponse,
)
from dtos.responses.comum import PaginaResponse
from model.evento_model import StatusEvento
from model.aposta_model import StatusAposta
from model.usuario_logado_model import UsuarioLogado

from repo import aposta_repo, evento_repo, usuario_repo
from repo.aposta_repo import (
    ApostaError,
    SaldoInsuficienteError,
    OpcaoIndisponivelError,
    EventoIndisponivelError,
    CancelamentoInvalidoError,
)
from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.paginacao_util import paginar
from util.perfis import Perfil
from util.rate_limiter import DynamicRateLimiter

# =============================================================================
# Routers
# =============================================================================

router = APIRouter(prefix="/apostas")
admin_router = APIRouter(prefix="/admin/apostas")
admin_liquidacao_router = APIRouter(prefix="/admin/eventos")
admin_dashboard_router = APIRouter(prefix="/admin")

# =============================================================================
# Rate Limiters
# =============================================================================

aposta_criar_limiter = DynamicRateLimiter(
    chave_max="rate_limit_aposta_criar_max",
    chave_minutos="rate_limit_aposta_criar_minutos",
    padrao_max=10,
    padrao_minutos=1,
    nome="aposta_criar",
)


# =============================================================================
# Apostador: criar aposta
# =============================================================================

@router.post(
    "",
    response_model=ApostaComSaldoResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao([Perfil.APOSTADOR.value])
async def criar(
    request: Request,
    dto: CriarApostaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Registra uma aposta do apostador logado (transação atômica)."""
    assert usuario_logado is not None
    checar_rate_limit(aposta_criar_limiter, request)

    try:
        aposta, saldo_apos = aposta_repo.criar_aposta(
            usuario_id=usuario_logado.id,
            opcao_aposta_id=dto.opcao_aposta_id,
            valor_apostado=dto.valor_apostado,
        )
    except SaldoInsuficienteError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except (OpcaoIndisponivelError, EventoIndisponivelError) as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ApostaError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )

    logger.info(
        f"Aposta #{aposta.id} de R${aposta.valor_apostado} criada por "
        f"usuário {usuario_logado.id} (opção {dto.opcao_aposta_id})"
    )
    return ApostaComSaldoResponse.de_aposta_com_saldo(aposta, saldo_apos)

# =============================================================================
# Apostador: cancelar aposta (com estorno)
# =============================================================================

@router.post("/{id}/cancelar", response_model=ApostaComSaldoResponse)
@requer_autenticacao([Perfil.APOSTADOR.value])
async def cancelar(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cancela uma aposta aberta do apostador logado e estorna o valor."""
    assert usuario_logado is not None

    try:
        aposta, saldo_apos = aposta_repo.cancelar_aposta(
            aposta_id=id,
            usuario_id=usuario_logado.id,
        )
    except CancelamentoInvalidoError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ApostaError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    logger.info(
        f"Aposta #{aposta.id} cancelada por usuário {usuario_logado.id} "
        f"(estorno de R${aposta.valor_apostado})"
    )
    return ApostaComSaldoResponse.de_aposta_com_saldo(aposta, saldo_apos)

# =============================================================================
# Apostador: minhas apostas
# =============================================================================

@router.get("/minhas", response_model=PaginaResponse[ApostaResponse])
@requer_autenticacao([Perfil.APOSTADOR.value])
async def listar_minhas(
    request: Request,
    status: Optional[str] = None,
    pagina: int = 1,
    por_pagina: int = 20,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista as apostas do apostador logado (filtro de status + paginação)."""
    assert usuario_logado is not None

    apostas = aposta_repo.listar_minhas(usuario_logado.id, status=status)
    paginacao = paginar(apostas, pagina, por_pagina)
    return PaginaResponse.de_paginacao(
        paginacao,
        [ApostaResponse.de_aposta(a) for a in paginacao.items],
    )


# =============================================================================
# Admin: listar todas as apostas
# =============================================================================

@admin_router.get("", response_model=PaginaResponse[ApostaAdminResponse])
@requer_autenticacao([Perfil.ADMIN.value])
async def listar_todas(
    request: Request,
    status: Optional[str] = None,
    usuario_id: Optional[int] = None,
    evento_id: Optional[int] = None,
    pagina: int = 1,
    por_pagina: int = 20,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todas as apostas (admin) com filtros e paginação."""
    assert usuario_logado is not None

    apostas = aposta_repo.listar_todas(
        status=status, usuario_id=usuario_id, evento_id=evento_id
    )
    paginacao = paginar(apostas, pagina, por_pagina)
    return PaginaResponse.de_paginacao(
        paginacao,
        [ApostaAdminResponse.de_aposta(a) for a in paginacao.items],
    )


# =============================================================================
# Admin: dashboard
# =============================================================================

@admin_dashboard_router.get("/dashboard", response_model=AdminDashboardResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def admin_dashboard(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Contadores e apostas recentes do painel administrativo."""
    assert usuario_logado is not None

    eventos_ativos = evento_repo.contar_por_status(StatusEvento.ABERTO.value)
    volume_apostado = aposta_repo.volume_apostado_total()
    total_apostadores = len(
        usuario_repo.obter_todos_por_perfil(Perfil.APOSTADOR.value)
    )
    apostas_pendentes = aposta_repo.contar_pendentes()
    recentes = aposta_repo.listar_recentes(limite=10)

    return AdminDashboardResponse(
        eventos_ativos=eventos_ativos,
        volume_apostado=round(volume_apostado, 2),
        total_apostadores=total_apostadores,
        apostas_pendentes=apostas_pendentes,
        apostas_recentes=[ApostaAdminResponse.de_aposta(a) for a in recentes],
    )


# =============================================================================
# Admin: liquidar evento
# =============================================================================

@admin_liquidacao_router.post(
    "/{id}/liquidar",
    response_model=LiquidacaoResponse,
)
@requer_autenticacao([Perfil.ADMIN.value])
async def liquidar(
    request: Request,
    id: int,
    dto: LiquidarEventoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Liquida um evento: marca a opção vencedora, processa apostas e credita ganhos."""
    assert usuario_logado is not None

    try:
        resumo = aposta_repo.liquidar_evento(
            evento_id=id,
            opcao_vencedora_id=dto.opcao_vencedora_id,
            descricao=dto.resultado_descricao,
        )
    except ApostaError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    logger.info(
        f"Evento {id} liquidado por admin {usuario_logado.id}: "
        f"{resumo['apostas_liquidadas']} apostas, "
        f"{resumo['apostas_ganhadoras']} ganhadoras, "
        f"R${resumo['total_pago']} pagos"
    )

    # Monta o EventoResponse do módulo de eventos (construído em paralelo).
    # Import tardio para não acoplar o import-time deste módulo ao de eventos.
    evento_payload = None
    try:
        from repo import evento_repo
        from dtos.responses.evento_response import EventoResponse

        evento = evento_repo.obter_por_id(id)
        if evento is not None:
            evento_payload = EventoResponse.de_evento(evento)
    except Exception as e:  # pragma: no cover - degradação graciosa
        logger.warning(
            f"Não foi possível montar EventoResponse na liquidação do evento {id}: {e}"
        )

    return LiquidacaoResponse(
        evento=evento_payload,
        apostas_liquidadas=resumo["apostas_liquidadas"],
        apostas_ganhadoras=resumo["apostas_ganhadoras"],
        total_pago=resumo["total_pago"],
    )
