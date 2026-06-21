"""DTOs de entrada do módulo de apostas (LanceBet)."""
from pydantic import BaseModel, Field, field_validator


class CriarApostaDTO(BaseModel):
    """DTO para criação de uma aposta pelo apostador."""

    opcao_aposta_id: int = Field(..., description="ID da opção de aposta escolhida")
    valor_apostado: float = Field(..., description="Valor fictício a apostar")

    @field_validator("opcao_aposta_id")
    @classmethod
    def _validar_opcao(cls, v: int) -> int:
        if not isinstance(v, int) or v <= 0:
            raise ValueError("Opção de aposta inválida.")
        return v

    @field_validator("valor_apostado")
    @classmethod
    def _validar_valor(cls, v: float) -> float:
        if v is None or v <= 0:
            raise ValueError("O valor da aposta deve ser maior que zero.")
        return round(float(v), 2)


class LiquidarEventoDTO(BaseModel):
    """DTO para liquidação de um evento (admin)."""

    opcao_vencedora_id: int = Field(..., description="ID da opção vencedora")
    resultado_descricao: str = Field(
        default="", description="Descrição livre do resultado (opcional)"
    )

    @field_validator("opcao_vencedora_id")
    @classmethod
    def _validar_opcao(cls, v: int) -> int:
        if not isinstance(v, int) or v <= 0:
            raise ValueError("Opção vencedora inválida.")
        return v

    @field_validator("resultado_descricao")
    @classmethod
    def _validar_descricao(cls, v: str) -> str:
        if v is None:
            return ""
        return v.strip()[:500]
