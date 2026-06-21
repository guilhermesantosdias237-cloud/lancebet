"""Schemas de resposta do módulo financeiro (carteira + movimentações).

Tipos espelhados EXATAMENTE no frontend (lib/types.ts + lib/schemas.ts):
- CarteiraResponse  <-> interface Carteira
- MovimentacaoResponse <-> interface Movimentacao
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.carteira_model import Carteira, MovimentacaoFinanceira


class CarteiraResponse(BaseModel):
    """Saldo e resumo da carteira do usuário logado."""

    id: int
    usuario_id: int
    saldo_ficticio: float = Field(..., description="Saldo fictício atual")
    atualizado_em: Optional[datetime] = None
    total_apostado: float = Field(
        default=0.0, description="Soma dos valores apostados (débitos de aposta)"
    )
    total_ganho: float = Field(
        default=0.0, description="Soma dos créditos de ganho (apostas vencedoras)"
    )

    @classmethod
    def de_carteira(cls, carteira: Carteira) -> "CarteiraResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=carteira.id,
            usuario_id=carteira.usuario_id,
            saldo_ficticio=carteira.saldo_ficticio,
            atualizado_em=carteira.atualizado_em,
            total_apostado=carteira.total_apostado,
            total_ganho=carteira.total_ganho,
        )


class MovimentacaoResponse(BaseModel):
    """Uma linha do extrato de movimentações financeiras."""

    id: int
    carteira_id: int
    aposta_id: Optional[int] = None
    tipo: str = Field(..., description="Tipo da movimentação")
    valor: float = Field(
        ..., description="Positivo para créditos, negativo para débitos"
    )
    saldo_apos: float = Field(..., description="Saldo da carteira após a movimentação")
    descricao: str
    criado_em: Optional[datetime] = None

    @classmethod
    def de_movimentacao(
        cls, movimentacao: MovimentacaoFinanceira
    ) -> "MovimentacaoResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=movimentacao.id,
            carteira_id=movimentacao.carteira_id,
            aposta_id=movimentacao.aposta_id,
            tipo=movimentacao.tipo.value,
            valor=movimentacao.valor,
            saldo_apos=movimentacao.saldo_apos,
            descricao=movimentacao.descricao,
            criado_em=movimentacao.criado_em,
        )
