import sqlite3
from datetime import datetime
from typing import Optional
from model.usuario_model import Usuario
from sql.usuario_sql import (
    CRIAR_TABELA,
    MIGRAR_COLUNAS,
    CRIAR_INDICE_CPF,
    OBTER_COLUNAS,
    INSERIR,
    ALTERAR,
    ALTERAR_SENHA,
    ATUALIZAR_STATUS,
    EXCLUIR,
    OBTER_POR_ID,
    OBTER_TODOS,
    OBTER_QUANTIDADE,
    OBTER_POR_EMAIL,
    OBTER_POR_CPF,
    OBTER_POR_EMAIL_OU_CPF,
    ATUALIZAR_TOKEN,
    OBTER_POR_TOKEN,
    LIMPAR_TOKEN,
    OBTER_TODOS_POR_PERFIL,
    BUSCAR_POR_TERMO,
)
from util.db_util import obter_conexao
from util.foto_util import criar_foto_padrao_usuario


def _row_to_usuario(row: sqlite3.Row) -> Usuario:
    """
    Converte uma linha do banco de dados em objeto Usuario.

    Args:
        row: Linha do cursor SQLite (sqlite3.Row)

    Returns:
        Objeto Usuario populado
    """
    colunas = row.keys()
    return Usuario(
        id=row["id"],
        nome=row["nome"],
        email=row["email"],
        senha=row["senha"],
        perfil=row["perfil"],
        cpf=row["cpf"] if "cpf" in colunas else None,
        data_nascimento=(
            row["data_nascimento"] if "data_nascimento" in colunas else None
        ),
        status=(row["status"] if "status" in colunas else None) or "Ativo",
        token_redefinicao=row["token_redefinicao"],
        data_token=row["data_token"],
        data_cadastro=row["data_cadastro"],
        data_atualizacao=row["data_atualizacao"]
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        # Migração idempotente: acrescenta colunas novas do MVP LanceBet em
        # bancos pré-existentes (CREATE TABLE IF NOT EXISTS não altera tabela
        # já criada).
        cursor.execute(OBTER_COLUNAS)
        existentes = {linha["name"] for linha in cursor.fetchall()}
        for nome_coluna, ddl in MIGRAR_COLUNAS:
            if nome_coluna not in existentes:
                cursor.execute(ddl)
        cursor.execute(CRIAR_INDICE_CPF)
        return True


def inserir(usuario: Usuario) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            usuario.nome,
            usuario.email,
            usuario.senha,
            usuario.perfil,
            usuario.cpf,
            usuario.data_nascimento,
            usuario.status or "Ativo"
        ))
        usuario_id = cursor.lastrowid

        # Criar foto padrão para o novo usuário
        if usuario_id:
            criar_foto_padrao_usuario(usuario_id)

        return usuario_id


def alterar(usuario: Usuario) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ALTERAR, (
            usuario.nome,
            usuario.email,
            usuario.perfil,
            usuario.cpf,
            usuario.data_nascimento,
            usuario.id
        ))
        return cursor.rowcount > 0


def atualizar_senha(id: int, senha: str) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ALTERAR_SENHA, (senha, id))
        return cursor.rowcount > 0


def atualizar_status(id: int, status: str) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_STATUS, (status, id))
        return cursor.rowcount > 0


def excluir(id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR, (id,))
        return cursor.rowcount > 0


def obter_por_id(id: int) -> Optional[Usuario]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_usuario(row)
        return None


def obter_todos() -> list[Usuario]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_usuario(row) for row in rows]


def obter_quantidade() -> int:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_QUANTIDADE)
        row = cursor.fetchone()
        return row["quantidade"] if row else 0


def obter_por_email(email: str) -> Optional[Usuario]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_EMAIL, (email,))
        row = cursor.fetchone()
        if row:
            return _row_to_usuario(row)
        return None


def _normalizar_cpf(valor: str) -> str:
    """Remove pontos, traços e espaços do CPF, mantendo apenas dígitos."""
    return "".join(c for c in valor if c.isdigit())


def obter_por_cpf(cpf: str) -> Optional[Usuario]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_CPF, (cpf,))
        row = cursor.fetchone()
        if row:
            return _row_to_usuario(row)
        return None


def obter_por_email_ou_cpf(identificador: str) -> Optional[Usuario]:
    """
    Busca usuário por e-mail OU CPF (login dual do LanceBet).

    O identificador pode ser um e-mail (comparação case-insensitive) ou um CPF
    com ou sem formatação. O CPF é normalizado (somente dígitos) antes da
    comparação, tanto no parâmetro quanto na coluna armazenada.
    """
    cpf_normalizado = _normalizar_cpf(identificador)
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_EMAIL_OU_CPF, (identificador, cpf_normalizado))
        row = cursor.fetchone()
        if row:
            return _row_to_usuario(row)
        return None


def atualizar_token(email: str, token: str, data_expiracao: datetime) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_TOKEN, (token, data_expiracao, email))
        return cursor.rowcount > 0


def obter_por_token(token: str) -> Optional[Usuario]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_TOKEN, (token,))
        row = cursor.fetchone()
        if row:
            return _row_to_usuario(row)
        return None


def limpar_token(id: int) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(LIMPAR_TOKEN, (id,))
        return cursor.rowcount > 0


def obter_todos_por_perfil(perfil: str) -> list[Usuario]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS_POR_PERFIL, (perfil,))
        rows = cursor.fetchall()
        return [_row_to_usuario(row) for row in rows]


def buscar_por_termo(termo: str, limit: int = 10) -> list[Usuario]:
    """
    Busca usuários por termo (pesquisa em nome e email).

    Args:
        termo: Termo de busca
        limit: Número máximo de resultados

    Returns:
        Lista de usuários que correspondem à busca
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(BUSCAR_POR_TERMO, (f"%{termo}%", f"%{termo}%", limit))
        rows = cursor.fetchall()
        return [_row_to_usuario(row) for row in rows]
