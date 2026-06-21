"""DTOs de entrada do módulo financeiro (carteira).

As rotas de carteira são somente leitura (GET), portanto não há DTO de corpo
de requisição. Este módulo expõe um DTO de parâmetros de paginação reutilizável
para o extrato, mantendo o contrato de query params explícito e validado.

O crédito/débito da carteira NÃO é exposto por endpoint próprio: ele acontece
como efeito colateral atômico dos fluxos de cadastro (crédito inicial), aposta
(débito) e liquidação (ganho), nos respectivos módulos.
"""
from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_inteiro_range


class ExtratoQueryDTO(BaseModel):
    """Parâmetros de paginação do extrato de movimentações."""

    pagina: int = Field(default=1, description="Página (1-based)")
    por_pagina: int = Field(default=20, description="Itens por página")

    _validar_pagina = field_validator("pagina")(
        validar_inteiro_range(1, 1_000_000, "Página")
    )
    _validar_por_pagina = field_validator("por_pagina")(
        validar_inteiro_range(1, 100, "Itens por página")
    )
