"""
Schemas de resposta do módulo de eventos esportivos (LanceBet).

Os campos espelham EXATAMENTE os tipos do frontend
(frontend/src/lib/types.ts):

- OpcaoApostaResponse  <-> OpcaoAposta
- EventoResponse       <-> Evento (com opcoes: OpcaoAposta[])
- EventoAdminResponse  <-> EventoAdmin (estende Evento + contadores)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.evento_model import EventoEsportivo, OpcaoAposta


class OpcaoApostaResponse(BaseModel):
    """Representação de uma opção de aposta (mercado)."""

    id: int
    evento_id: int
    descricao: str
    sub: str
    odd: float
    status: str = Field(..., description="Status da opção (Ativa|Suspensa)")
    vencedora: bool

    @classmethod
    def de_opcao(cls, opcao: OpcaoAposta) -> "OpcaoApostaResponse":
        return cls(
            id=opcao.id,
            evento_id=opcao.evento_id,
            descricao=opcao.descricao,
            sub=opcao.sub,
            odd=opcao.odd,
            status=opcao.status.value,
            vencedora=opcao.vencedora,
        )


class EventoResponse(BaseModel):
    """Representação pública de um evento esportivo com opções embutidas."""

    id: int
    mandante: str
    visitante: str
    titulo: str
    esporte: str
    competicao: str
    data_hora: Optional[str] = None
    status: str = Field(..., description="Status do evento (Aberto|Fechado|Liquidado)")
    resultado_descricao: Optional[str] = None
    criado_por: int
    criado_em: Optional[datetime] = None
    opcoes: list[OpcaoApostaResponse] = Field(default_factory=list)

    @classmethod
    def de_evento(cls, evento: EventoEsportivo) -> "EventoResponse":
        return cls(
            id=evento.id,
            mandante=evento.mandante,
            visitante=evento.visitante,
            titulo=evento.titulo,
            esporte=evento.esporte,
            competicao=evento.competicao,
            data_hora=evento.data_hora,
            status=evento.status.value,
            resultado_descricao=evento.resultado_descricao,
            criado_por=evento.criado_por,
            criado_em=evento.criado_em,
            opcoes=[OpcaoApostaResponse.de_opcao(o) for o in evento.opcoes],
        )


class EventoAdminResponse(EventoResponse):
    """Evento com contadores agregados para o painel administrativo."""

    total_apostas: int = 0
    volume_apostado: float = 0.0

    @classmethod
    def de_evento_admin(
        cls,
        evento: EventoEsportivo,
        total_apostas: int = 0,
        volume_apostado: float = 0.0,
    ) -> "EventoAdminResponse":
        return cls(
            id=evento.id,
            mandante=evento.mandante,
            visitante=evento.visitante,
            titulo=evento.titulo,
            esporte=evento.esporte,
            competicao=evento.competicao,
            data_hora=evento.data_hora,
            status=evento.status.value,
            resultado_descricao=evento.resultado_descricao,
            criado_por=evento.criado_por,
            criado_em=evento.criado_em,
            opcoes=[OpcaoApostaResponse.de_opcao(o) for o in evento.opcoes],
            total_apostas=total_apostas,
            volume_apostado=volume_apostado,
        )
