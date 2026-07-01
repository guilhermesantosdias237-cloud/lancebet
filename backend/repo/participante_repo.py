import sqlite3
from typing import Optional

from model.participante_model import Participante
from sql.participante_sql import (
    CRIAR_TABELA_PARTICIPANTE,
    INSERIR_PARTICIPANTE,
    OBTER_PARTICIPANTE_POR_ID,
    OBTER_PARTICIPANTES_BASE,
    OBTER_PARTICIPANTES_ORDER,
    ATUALIZAR_PARTICIPANTE,
    EXCLUIR_PARTICIPANTE,
)
from util.db_util import obter_conexao


# =============================================================================
# Mapeador linha -> objeto
# =============================================================================

def _row_to_participante(row: sqlite3.Row) -> Participante:
    return Participante(
        id=row["id"],
        nome=row["nome"],
        escudo_url=row["escudo_url"],
        esporte=row["esporte"],
        ativo=bool(row["ativo"]),
    )


# =============================================================================
# Criação de tabela
# =============================================================================

def criar_tabela() -> bool:
    """Cria a tabela participante."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_PARTICIPANTE)
        return True


# =============================================================================
# CRUD
# =============================================================================

def criar(participante: Participante) -> Optional[int]:
    """Insere um participante. Retorna o id criado."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR_PARTICIPANTE,
            (
                participante.nome,
                participante.escudo_url,
                participante.esporte,
                1 if participante.ativo else 0,
            ),
        )
        return cursor.lastrowid


def obter_por_id(id: int) -> Optional[Participante]:
    """Retorna o participante pelo id, ou None."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_PARTICIPANTE_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_participante(row) if row else None


def listar(apenas_ativos: bool = False) -> list[Participante]:
    """Lista participantes ordenados por nome. Filtra por ativos se pedido."""
    clausulas: list[str] = []
    params: list = []

    if apenas_ativos:
        clausulas.append("ativo = ?")
        params.append(1)

    sql = OBTER_PARTICIPANTES_BASE
    if clausulas:
        sql += " WHERE " + " AND ".join(clausulas)
    sql += OBTER_PARTICIPANTES_ORDER

    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        return [_row_to_participante(r) for r in cursor.fetchall()]


def atualizar(participante: Participante) -> bool:
    """Atualiza os dados de um participante. Retorna True se algo mudou."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR_PARTICIPANTE,
            (
                participante.nome,
                participante.escudo_url,
                participante.esporte,
                1 if participante.ativo else 0,
                participante.id,
            ),
        )
        return cursor.rowcount > 0


def excluir(id: int) -> bool:
    """Exclui um participante pelo id. Retorna True se excluiu algo."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR_PARTICIPANTE, (id,))
        return cursor.rowcount > 0