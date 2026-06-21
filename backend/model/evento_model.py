"""
Modelos de domínio do módulo de eventos esportivos do LanceBet.

Define os enums de status (evento e opção) e as dataclasses
``EventoEsportivo`` e ``OpcaoAposta``. As entidades aqui são SQL puro
(sem ORM); o mapeamento linha->objeto fica em ``repo/evento_repo.py``.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from util.enum_base import EnumEntidade


class StatusEvento(EnumEntidade):
    """Status de um evento esportivo.

    - ABERTO: aceitando apostas.
    - FECHADO: visível mas sem aceitar novas apostas.
    - LIQUIDADO: resultado definido e apostas processadas (estado final).
    """

    ABERTO = "Aberto"
    FECHADO = "Fechado"
    LIQUIDADO = "Liquidado"


class StatusOpcao(EnumEntidade):
    """Status de uma opção de aposta (mercado).

    - ATIVA: disponível para apostas.
    - SUSPENSA: temporariamente indisponível.
    """

    ATIVA = "Ativa"
    SUSPENSA = "Suspensa"


@dataclass
class OpcaoAposta:
    """Opção de aposta (mercado) pertencente a um evento."""

    id: int
    evento_id: int
    descricao: str
    sub: str
    odd: float
    status: StatusOpcao = StatusOpcao.ATIVA
    vencedora: bool = False


@dataclass
class EventoEsportivo:
    """Evento esportivo com suas opções de aposta embutidas."""

    id: int
    mandante: str
    visitante: str
    titulo: str
    esporte: str
    competicao: str
    data_hora: Optional[str]
    status: StatusEvento
    resultado_descricao: Optional[str]
    criado_por: int
    criado_em: Optional[datetime] = None
    opcoes: list[OpcaoAposta] = field(default_factory=list)
