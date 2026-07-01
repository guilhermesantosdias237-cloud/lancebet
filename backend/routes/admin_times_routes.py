# =============================================================================
# Rotas de Administração de Times/Participantes (API JSON)
# =============================================================================

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Response, status

# DTOs (entrada)
from dtos.participante_dto import CriarParticipanteDTO, AtualizarParticipanteDTO

# Schemas (saída)
from dtos.responses.participante_response import ParticipanteResponse

# Models
from model.participante_model import Participante
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import participante_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.perfis import Perfil

# =============================================================================
# Routers
# =============================================================================

# Listagem pública para alimentar o <select> de mandante/visitante.
router = APIRouter(prefix="/times")
# CRUD restrito a administradores.
admin_router = APIRouter(prefix="/admin/times")


# =============================================================================
# Helpers
# =============================================================================

def _obter_participante_ou_404(id: int) -> Participante:
    """Carrega o participante ou lança 404."""
    participante = participante_repo.obter_por_id(id)
    if not participante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante não encontrado.",
        )
    return participante


# =============================================================================
# Rota pública — listagem para o select
# =============================================================================

@router.get("", response_model=list[ParticipanteResponse])
async def listar_times(request: Request):
    """Lista os participantes ATIVOS (usado no select do formulário de evento)."""
    participantes = participante_repo.listar(apenas_ativos=True)
    return [ParticipanteResponse.de_participante(p) for p in participantes]


# =============================================================================
# Rotas admin — CRUD
# =============================================================================

@admin_router.get("", response_model=list[ParticipanteResponse])
@requer_autenticacao([Perfil.ADMIN.value])
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista TODOS os participantes (ativos e inativos) para o painel admin."""
    assert usuario_logado is not None
    participantes = participante_repo.listar()
    return [ParticipanteResponse.de_participante(p) for p in participantes]


@admin_router.post(
    "",
    response_model=ParticipanteResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao([Perfil.ADMIN.value])
async def criar(
    request: Request,
    dto: CriarParticipanteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria um novo participante (time)."""
    assert usuario_logado is not None

    participante = Participante(
        id=0,
        nome=dto.nome,
        escudo_url=dto.escudo_url,
        esporte=dto.esporte,
        ativo=dto.ativo,
    )
    participante_id = participante_repo.criar(participante)
    if not participante_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar participante. Tente novamente.",
        )

    logger.info(f"Participante #{participante_id} criado por admin {usuario_logado.id}")
    return ParticipanteResponse.de_participante(_obter_participante_ou_404(participante_id))


@admin_router.put("/{id}", response_model=ParticipanteResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def alterar(
    request: Request,
    id: int,
    dto: AtualizarParticipanteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza os dados de um participante."""
    assert usuario_logado is not None
    _obter_participante_ou_404(id)

    participante = Participante(
        id=id,
        nome=dto.nome,
        escudo_url=dto.escudo_url,
        esporte=dto.esporte,
        ativo=dto.ativo,
    )
    if not participante_repo.atualizar(participante):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao alterar participante. Tente novamente.",
        )

    logger.info(f"Participante {id} alterado por admin {usuario_logado.id}")
    return ParticipanteResponse.de_participante(_obter_participante_ou_404(id))


@admin_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
@requer_autenticacao([Perfil.ADMIN.value])
async def excluir(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Exclui um participante."""
    assert usuario_logado is not None
    _obter_participante_ou_404(id)

    if not participante_repo.excluir(id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir participante. Tente novamente.",
        )

    logger.info(f"Participante {id} excluído por admin {usuario_logado.id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)