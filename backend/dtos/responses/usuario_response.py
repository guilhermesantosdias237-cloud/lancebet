"""Schemas de resposta do módulo de usuários."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from model.usuario_model import Usuario
from util.foto_util import obter_caminho_foto_usuario


class UsuarioResponse(BaseModel):
    """Representação pública de um usuário (sem dados sensíveis)."""

    id: int
    nome: str
    email: str
    perfil: str
    cpf: Optional[str] = Field(default=None, description="CPF do usuário (pode ser nulo)")
    data_nascimento: Optional[str] = Field(
        default=None, description="Data de nascimento em formato ISO 8601 (YYYY-MM-DD)"
    )
    status: str = Field(default="Ativo", description="Status do usuário (Ativo|Bloqueado)")
    foto_url: str = Field(..., description="URL relativa da foto de perfil")
    data_cadastro: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None

    @classmethod
    def de_usuario(cls, usuario: Usuario) -> "UsuarioResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=usuario.id,
            nome=usuario.nome,
            email=usuario.email,
            perfil=usuario.perfil,
            cpf=usuario.cpf,
            data_nascimento=usuario.data_nascimento,
            status=usuario.status or "Ativo",
            foto_url=obter_caminho_foto_usuario(usuario.id),
            data_cadastro=usuario.data_cadastro,
            data_atualizacao=usuario.data_atualizacao,
        )


class UsuarioComSaldoResponse(UsuarioResponse):
    """Usuário autenticado com o saldo fictício da carteira embutido.

    Usado por POST /login, POST /cadastrar e GET /me. Espelhado no frontend
    como a interface ``UsuarioComSaldo`` (lib/types.ts). Estende
    ``UsuarioResponse`` acrescentando ``saldo_ficticio``.
    """

    saldo_ficticio: float = Field(
        default=0.0, description="Saldo fictício atual da carteira do usuário"
    )

    @classmethod
    def de_usuario_e_saldo(
        cls, usuario: Usuario, saldo_ficticio: float
    ) -> "UsuarioComSaldoResponse":
        """Constrói o response a partir da entidade e do saldo da carteira."""
        return cls(
            id=usuario.id,
            nome=usuario.nome,
            email=usuario.email,
            perfil=usuario.perfil,
            cpf=usuario.cpf,
            data_nascimento=usuario.data_nascimento,
            status=usuario.status or "Ativo",
            foto_url=obter_caminho_foto_usuario(usuario.id),
            saldo_ficticio=saldo_ficticio,
            data_cadastro=usuario.data_cadastro,
            data_atualizacao=usuario.data_atualizacao,
        )


class UsuarioAdminResponse(UsuarioResponse):
    """Usuário na visão administrativa: saldo fictício + total de apostas.

    Espelha a interface ``UsuarioAdmin`` (frontend lib/types.ts).
    """

    saldo_ficticio: float = Field(
        default=0.0, description="Saldo fictício atual da carteira"
    )
    total_apostas: int = Field(default=0, description="Total de apostas do usuário")

    @classmethod
    def de_usuario_admin(
        cls, usuario: Usuario, saldo_ficticio: float, total_apostas: int
    ) -> "UsuarioAdminResponse":
        return cls(
            id=usuario.id,
            nome=usuario.nome,
            email=usuario.email,
            perfil=usuario.perfil,
            cpf=usuario.cpf,
            data_nascimento=usuario.data_nascimento,
            status=usuario.status or "Ativo",
            foto_url=obter_caminho_foto_usuario(usuario.id),
            saldo_ficticio=saldo_ficticio,
            total_apostas=total_apostas,
            data_cadastro=usuario.data_cadastro,
            data_atualizacao=usuario.data_atualizacao,
        )
