from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator
from dtos.validators import (
    validar_email,
    validar_tipo,
    validar_senha_forte,
    validar_senha_simples,
    validar_nome_pessoa,
    validar_string_obrigatoria,
    validar_senhas_coincidem,
    validar_maioridade,
    validar_cpf_opcional,
    validar_aceite_termos,
)
from util.perfis import Perfil


class LoginDTO(BaseModel):
    email: str = Field(..., description="E-mail do usuário")
    senha: str = Field(..., description="Senha do usuário")

    _validar_email = field_validator("email")(validar_email())
    _validar_senha = field_validator("senha")(
        validar_string_obrigatoria("Senha", tamanho_minimo=1)
    )


class LoginLanceBetDTO(BaseModel):
    """Login dual do LanceBet: identificador pode ser e-mail OU CPF."""

    identificador: str = Field(
        ..., description="E-mail ou CPF (com ou sem formatação) do usuário"
    )
    senha: str = Field(..., description="Senha do usuário")

    _validar_identificador = field_validator("identificador")(
        validar_string_obrigatoria("Identificador", tamanho_minimo=1)
    )
    _validar_senha = field_validator("senha")(
        validar_string_obrigatoria("Senha", tamanho_minimo=1)
    )


class CadastroApostadorDTO(BaseModel):
    """Cadastro de apostador (perfil fixo 'Apostador', definido no servidor).

    O perfil NÃO é enviado pelo cliente: toda conta criada por este fluxo é de
    apostador. A senha usa a regra simples do MVP (mínimo 6 caracteres). O CPF é
    opcional, mas validado se informado. A maioridade (>= 18) é checada a partir
    de ``data_nascimento`` (formato ISO AAAA-MM-DD).
    """

    nome: str = Field(..., description="Nome completo do apostador")
    email: str = Field(..., description="E-mail do apostador")
    cpf: Optional[str] = Field(default=None, description="CPF (opcional)")
    data_nascimento: str = Field(
        ..., description="Data de nascimento (AAAA-MM-DD)"
    )
    senha: str = Field(..., description="Senha (mínimo 6 caracteres)")
    aceite_termos: bool = Field(
        ..., description="Aceite dos termos de uso (obrigatório)"
    )

    _validar_nome = field_validator("nome")(validar_nome_pessoa())
    _validar_email = field_validator("email")(validar_email())
    _validar_cpf = field_validator("cpf")(validar_cpf_opcional())
    _validar_data_nascimento = field_validator("data_nascimento")(
        validar_maioridade(idade_minima=18)
    )
    _validar_senha = field_validator("senha")(validar_senha_simples(tamanho_minimo=6))
    _validar_aceite = field_validator("aceite_termos")(validar_aceite_termos())


class CadastroDTO(BaseModel):
    perfil: str = Field(..., description="Perfil/Role do usuário")
    nome: str = Field(..., description="Nome completo do usuário")
    email: str = Field(..., description="E-mail do usuário")
    senha: str = Field(..., description="Senha do usuário")
    confirmar_senha: str = Field(..., description="Confirmação da senha")

    _validar_perfil = field_validator("perfil")(validar_tipo("Perfil", Perfil))
    _validar_nome = field_validator("nome")(validar_nome_pessoa())
    _validar_email = field_validator("email")(validar_email())
    _validar_senha = field_validator("senha")(validar_senha_forte())
    _validar_confirmar = field_validator("confirmar_senha")(validar_senha_forte())

    _validar_senhas_match = model_validator(mode="after")(validar_senhas_coincidem())


class EsqueciSenhaDTO(BaseModel):
    email: str = Field(..., description="E-mail cadastrado do usuário")

    _validar_email = field_validator("email")(validar_email())


class RedefinirSenhaDTO(BaseModel):
    token: str = Field(..., description="Token de redefinição recebido por e-mail")
    senha: str = Field(..., description="Nova senha do usuário")
    confirmar_senha: str = Field(..., description="Confirmação da nova senha")

    _validar_token = field_validator("token")(
        validar_string_obrigatoria("Token", tamanho_minimo=1)
    )
    _validar_senha = field_validator("senha")(validar_senha_forte())
    _validar_confirmar = field_validator("confirmar_senha")(validar_senha_forte())

    _validar_senhas_match = model_validator(mode="after")(validar_senhas_coincidem())
