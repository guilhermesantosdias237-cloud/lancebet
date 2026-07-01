from typing import Optional

from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria


class CriarParticipanteDTO(BaseModel):
    """Cria um novo participante (time)."""

    nome: str = Field(..., description="Nome do time/participante")
    escudo_url: Optional[str] = Field(default=None, description="URL do escudo (opcional)")
    esporte: str = Field(default="Futebol", description="Esporte do participante")
    ativo: bool = Field(default=True, description="Se o participante está ativo")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=80)
    )


class AtualizarParticipanteDTO(BaseModel):
    """Atualiza os dados de um participante existente."""

    nome: str = Field(..., description="Nome do time/participante")
    escudo_url: Optional[str] = Field(default=None, description="URL do escudo (opcional)")
    esporte: str = Field(default="Futebol", description="Esporte do participante")
    ativo: bool = Field(default=True, description="Se o participante está ativo")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=80)
    )