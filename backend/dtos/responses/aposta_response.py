"""Schemas de resposta do módulo de apostas (LanceBet).

Espelham EXATAMENTE os tipos do frontend (lib/types.ts):
- Aposta            -> ApostaResponse
- ApostaComSaldo    -> ApostaComSaldoResponse
- (admin)           -> ApostaAdminResponse
- LiquidacaoResultado -> LiquidacaoResponse

``LiquidacaoResponse.evento`` é tipado de forma permissiva (Any) para manter
desacoplamento do módulo de eventos (construído em paralelo); a rota injeta um
``EventoResponse`` já serializado.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from model.aposta_model import Aposta


class ApostaResponse(BaseModel):
    """Representação de uma aposta (apostador)."""

    id: int
    usuario_id: int
    opcao_aposta_id: int
    valor_apostado: float
    odd_registrada: float
    retorno_potencial: float
    status: str = Field(..., description="Status da aposta")
    resultado: str = Field(..., description="Resultado da aposta")
    criada_em: Optional[datetime] = None
    liquidada_em: Optional[datetime] = None
    # Desnormalizados para exibição
    titulo_evento: Optional[str] = None
    descricao_opcao: Optional[str] = None
    nome_usuario: Optional[str] = None

    @classmethod
    def de_aposta(cls, aposta: Aposta) -> "ApostaResponse":
        return cls(
            id=aposta.id,
            usuario_id=aposta.usuario_id,
            opcao_aposta_id=aposta.opcao_aposta_id,
            valor_apostado=aposta.valor_apostado,
            odd_registrada=aposta.odd_registrada,
            retorno_potencial=aposta.retorno_potencial,
            status=aposta.status.value,
            resultado=aposta.resultado.value,
            criada_em=aposta.criada_em,
            liquidada_em=aposta.liquidada_em,
            titulo_evento=aposta.titulo_evento,
            descricao_opcao=aposta.descricao_opcao,
            nome_usuario=aposta.nome_usuario,
        )


class ApostaComSaldoResponse(ApostaResponse):
    """Aposta recém-criada acrescida do saldo da carteira após o débito."""

    saldo_apos: float = Field(..., description="Saldo fictício após a aposta")

    @classmethod
    def de_aposta_com_saldo(
        cls, aposta: Aposta, saldo_apos: float
    ) -> "ApostaComSaldoResponse":
        base = ApostaResponse.de_aposta(aposta)
        return cls(**base.model_dump(), saldo_apos=round(saldo_apos, 2))


class ApostaAdminResponse(ApostaResponse):
    """Aposta na visão administrativa (mesmos campos + nome do usuário garantido)."""

    @classmethod
    def de_aposta(cls, aposta: Aposta) -> "ApostaAdminResponse":
        return cls(
            id=aposta.id,
            usuario_id=aposta.usuario_id,
            opcao_aposta_id=aposta.opcao_aposta_id,
            valor_apostado=aposta.valor_apostado,
            odd_registrada=aposta.odd_registrada,
            retorno_potencial=aposta.retorno_potencial,
            status=aposta.status.value,
            resultado=aposta.resultado.value,
            criada_em=aposta.criada_em,
            liquidada_em=aposta.liquidada_em,
            titulo_evento=aposta.titulo_evento,
            descricao_opcao=aposta.descricao_opcao,
            nome_usuario=aposta.nome_usuario,
        )


class LiquidacaoResponse(BaseModel):
    """Resumo da liquidação de um evento."""

    evento: Any = Field(..., description="Evento liquidado (EventoResponse)")
    apostas_liquidadas: int
    apostas_ganhadoras: int
    total_pago: float


class AdminDashboardResponse(BaseModel):
    """Contadores e apostas recentes do painel admin (espelha AdminDashboard)."""

    eventos_ativos: int = Field(..., description="Eventos com status 'Aberto'")
    volume_apostado: float = Field(..., description="Soma de valor_apostado")
    total_apostadores: int = Field(..., description="Usuários perfil 'Apostador'")
    apostas_pendentes: int = Field(..., description="Apostas com status 'Aberta'")
    apostas_recentes: list[ApostaAdminResponse] = Field(default_factory=list)
