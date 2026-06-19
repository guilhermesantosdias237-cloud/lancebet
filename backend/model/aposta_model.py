"""Modelo de domínio para apostas do LanceBet."""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from util.enum_base import EnumEntidade


class StatusAposta(EnumEntidade):
    """
    Status de uma aposta.

    Herda de EnumEntidade (valores/existe/from_valor/validar).
    """

    ABERTA = "Aberta"
    LIQUIDADA = "Liquidada"
    CANCELADA = "Cancelada"


class ResultadoAposta(EnumEntidade):
    """Resultado de uma aposta após liquidação do evento."""

    PENDENTE = "Pendente"
    GANHOU = "Ganhou"
    PERDEU = "Perdeu"


@dataclass
class Aposta:
    id: int
    usuario_id: int
    opcao_aposta_id: int
    valor_apostado: float
    odd_registrada: float
    retorno_potencial: float
    status: StatusAposta = StatusAposta.ABERTA
    resultado: ResultadoAposta = ResultadoAposta.PENDENTE
    criada_em: Optional[datetime] = None
    liquidada_em: Optional[datetime] = None
    # Campos desnormalizados (snapshot e JOIN) para exibição
    evento_id: Optional[int] = None
    titulo_evento: Optional[str] = None
    descricao_opcao: Optional[str] = None
    nome_usuario: Optional[str] = None
