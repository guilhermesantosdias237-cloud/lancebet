"""Modelos de domínio do módulo financeiro: Carteira e MovimentacaoFinanceira."""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from util.enum_base import EnumEntidade


class TipoMovimentacao(EnumEntidade):
    """Tipos de movimentação financeira sobre a carteira.

    - CREDITO_INICIAL: crédito de boas-vindas no cadastro (valor positivo).
    - APOSTA: débito ao confirmar uma aposta (valor negativo).
    - GANHO: crédito ao liquidar uma aposta vencedora (valor positivo).
    - ESTORNO: crédito de devolução (valor positivo).
    """

    CREDITO_INICIAL = "Credito Inicial"
    APOSTA = "Aposta"
    GANHO = "Ganho"
    ESTORNO = "Estorno"


@dataclass
class Carteira:
    id: int
    usuario_id: int
    saldo_ficticio: float
    atualizado_em: Optional[datetime] = None
    # Campos agregados (resumo), preenchidos sob demanda
    total_apostado: float = 0.0
    total_ganho: float = 0.0


@dataclass
class MovimentacaoFinanceira:
    id: int
    carteira_id: int
    tipo: TipoMovimentacao
    valor: float
    saldo_apos: float
    descricao: str
    aposta_id: Optional[int] = None
    criado_em: Optional[datetime] = None
