"""Rotas do módulo financeiro: carteira do apostador (API JSON).

Perfil exigido: apostador autenticado (@requer_autenticacao()).

- GET /api/carteira          -> saldo e resumo (total apostado / total ganho)
- GET /api/carteira/extrato  -> PaginaResponse[MovimentacaoResponse]

A criação da carteira e o crédito inicial acontecem no cadastro; aqui apenas
se consulta. Caso (excepcionalmente) o usuário ainda não possua carteira, ela
é criada com saldo zero sob demanda para nunca quebrar a leitura.
"""

# =============================================================================
# Imports
# =============================================================================

from typing import Optional

from fastapi import APIRouter, Request

# Schemas (saída)
from dtos.responses.carteira_response import CarteiraResponse, MovimentacaoResponse
from dtos.responses.comum import PaginaResponse
from dtos.responses.carteira_response import (
    CarteiraResponse,
    MovimentacaoResponse,
    RankingItemResponse,
)
from dtos.responses.comum import PaginaResponse

# Models
from model.carteira_model import Carteira
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import carteira_repo

# Utilities
from util.api_helpers import checar_rate_limit
from util.auth_decorator import requer_autenticacao
from util.rate_limiter import DynamicRateLimiter




# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/carteira")

# =============================================================================
# Rate Limiters
# =============================================================================

carteira_extrato_limiter = DynamicRateLimiter(
    chave_max="rate_limit_carteira_extrato_max",
    chave_minutos="rate_limit_carteira_extrato_minutos",
    padrao_max=60,
    padrao_minutos=1,
    nome="carteira_extrato",
)


# =============================================================================
# Helpers
# =============================================================================

def _garantir_carteira(usuario_id: int) -> Carteira:
    """Obtém a carteira (com resumo) do usuário, criando-a com saldo zero se
    ainda não existir — garante que a leitura nunca falhe por ausência."""
    carteira = carteira_repo.obter_com_resumo(usuario_id)
    if carteira is None:
        carteira_repo.criar_carteira(usuario_id, saldo_inicial=0.0)
        carteira = carteira_repo.obter_com_resumo(usuario_id)
    assert carteira is not None
    return carteira


# =============================================================================
# Saldo e resumo
# =============================================================================

@router.get("", response_model=CarteiraResponse)
@requer_autenticacao()
async def obter_carteira(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Retorna o saldo fictício atual e o resumo da carteira do usuário."""
    assert usuario_logado is not None
    carteira = _garantir_carteira(usuario_logado.id)
    return CarteiraResponse.de_carteira(carteira)


# =============================================================================
# Extrato (movimentações)
# =============================================================================

@router.get("/extrato", response_model=PaginaResponse[MovimentacaoResponse])
@requer_autenticacao()
async def listar_extrato(
    request: Request,
    pagina: int = 1,
    por_pagina: int = 20,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista as movimentações da carteira (mais recentes primeiro), paginadas."""
    assert usuario_logado is not None
    checar_rate_limit(carteira_extrato_limiter, request)

    paginacao = carteira_repo.listar_por_usuario(
        usuario_logado.id, pagina, por_pagina
    )
    return PaginaResponse.de_paginacao(
        paginacao,
        [MovimentacaoResponse.de_movimentacao(m) for m in paginacao.items],
    )

# =============================================================================
# Ranking de apostadores
# =============================================================================

@router.get("/ranking", response_model=list[RankingItemResponse])
@requer_autenticacao()
async def listar_ranking(
    request: Request,
    limite: int = 50,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Retorna o ranking de apostadores (top N por total ganho)."""
    assert usuario_logado is not None

    if limite <= 0 or limite > 200:
        limite = 50

    itens = carteira_repo.ranking(limite)
    return [RankingItemResponse.de_dict(i) for i in itens]
