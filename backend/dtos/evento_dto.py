"""
DTOs de entrada do módulo de eventos esportivos (LanceBet).

Cobre criação/edição de eventos, alteração de status, e operações sobre
opções de aposta (criar opção, atualizar odd, alternar status) e liquidação.

Regras de validação espelham o protótipo (design/lancebet-react AppContext):
- mandante e visitante obrigatórios;
- todas as odds devem ser > 1.0;
- descrição de opção obrigatória.
"""

from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria, validar_tipo
from model.evento_model import StatusEvento, StatusOpcao


def _validar_odd(cls, v):
    """Valida que a odd é numérica e estritamente maior que 1.0."""
    try:
        odd = float(v)
    except (TypeError, ValueError):
        raise ValueError("Odd deve ser um número.")
    if odd <= 1.0:
        raise ValueError("Odd deve ser maior que 1,00.")
    return round(odd, 2)


class CriarEventoDTO(BaseModel):
    """Cria um evento esportivo gerando 3 opções (Mandante/Empate/Visitante)."""

    mandante: str = Field(..., description="Time mandante")
    visitante: str = Field(..., description="Time visitante")
    competicao: str = Field(
        default="Brasileirão Série A", description="Competição do evento"
    )
    data_hora: str = Field(
        default="A definir",
        description="Data/hora em texto livre (ex: 'Sáb · 20 jun · 16:00')",
    )
    odd_mandante: float = Field(..., description="Odd para vitória do mandante")
    odd_empate: float = Field(..., description="Odd para empate")
    odd_visitante: float = Field(..., description="Odd para vitória do visitante")

    _validar_mandante = field_validator("mandante")(
        validar_string_obrigatoria(nome_campo="Mandante", tamanho_minimo=2, tamanho_maximo=80)
    )
    _validar_visitante = field_validator("visitante")(
        validar_string_obrigatoria(nome_campo="Visitante", tamanho_minimo=2, tamanho_maximo=80)
    )
    _validar_odd_m = field_validator("odd_mandante")(_validar_odd)
    _validar_odd_e = field_validator("odd_empate")(_validar_odd)
    _validar_odd_v = field_validator("odd_visitante")(_validar_odd)


class AtualizarEventoDTO(BaseModel):
    """Atualiza dados básicos de um evento (sem alterar status nem opções)."""

    mandante: str = Field(..., description="Time mandante")
    visitante: str = Field(..., description="Time visitante")
    competicao: str = Field(
        default="Brasileirão Série A", description="Competição do evento"
    )
    data_hora: str = Field(default="A definir", description="Data/hora em texto livre")
    esporte: str = Field(default="Futebol", description="Esporte do evento")

    _validar_mandante = field_validator("mandante")(
        validar_string_obrigatoria(nome_campo="Mandante", tamanho_minimo=2, tamanho_maximo=80)
    )
    _validar_visitante = field_validator("visitante")(
        validar_string_obrigatoria(nome_campo="Visitante", tamanho_minimo=2, tamanho_maximo=80)
    )


class AlterarStatusEventoDTO(BaseModel):
    """Altera o status do evento entre 'Aberto' e 'Fechado'."""

    status: str = Field(..., description="Novo status do evento (Aberto|Fechado)")

    @field_validator("status")
    @classmethod
    def _validar_status(cls, v):
        permitidos = (StatusEvento.ABERTO.value, StatusEvento.FECHADO.value)
        if v not in permitidos:
            raise ValueError(
                f"Status deve ser '{StatusEvento.ABERTO.value}' ou "
                f"'{StatusEvento.FECHADO.value}'."
            )
        return v


class AdicionarOpcaoDTO(BaseModel):
    """Adiciona uma nova opção de aposta a um evento."""

    descricao: str = Field(..., description="Descrição da opção/mercado")
    sub: str = Field(default="Mercado", description="Subtítulo exibido na UI")
    odd: float = Field(..., description="Odd da opção (> 1.0)")

    _validar_descricao = field_validator("descricao")(
        validar_string_obrigatoria(nome_campo="Descrição", tamanho_minimo=1, tamanho_maximo=120)
    )
    _validar_odd = field_validator("odd")(_validar_odd)


class AtualizarOddDTO(BaseModel):
    """Atualiza a odd de uma opção de aposta."""

    odd: float = Field(..., description="Nova odd (> 1.0)")

    _validar_odd = field_validator("odd")(_validar_odd)


class AlterarStatusOpcaoDTO(BaseModel):
    """Suspende ou reativa uma opção de aposta."""

    status: str = Field(..., description="Novo status da opção (Ativa|Suspensa)")

    _validar_status = field_validator("status")(validar_tipo("Status", StatusOpcao))


class LiquidarEventoDTO(BaseModel):
    """Liquida um evento marcando a opção vencedora."""

    opcao_vencedora_id: int = Field(..., description="Id da opção vencedora")
    resultado_descricao: str = Field(
        default="", description="Descrição textual do resultado (opcional)"
    )

    @field_validator("opcao_vencedora_id")
    @classmethod
    def _validar_opcao(cls, v):
        if not isinstance(v, int) or v <= 0:
            raise ValueError("Opção vencedora inválida.")
        return v
