"""Repositório do módulo financeiro: carteira + movimentacao_financeira.

Regras invioláveis de saldo:
- ``saldo_ficticio`` NUNCA pode ficar negativo (enforce em ``atualizar_saldo``).
- Toda atualização de saldo usa UPDATE atômico via ``ATUALIZAR_SALDO`` —
  nunca ler-somar-escrever fora de transação.
- Os fluxos de aposta/liquidação (em outros módulos) devem usar a conexão
  passada via ``conn`` para encadear débito/crédito + movimentação dentro de
  uma única transação (BEGIN IMMEDIATE).

As funções que mutam aceitam um ``conn`` opcional: quando fornecido, operam
dentro da transação do chamador (sem commit próprio); quando ausente, abrem
uma conexão própria que faz commit no fim (context manager ``obter_conexao``).
"""

import sqlite3
from typing import Optional, Type, TypeVar
from enum import Enum

from model.carteira_model import (
    Carteira,
    MovimentacaoFinanceira,
    TipoMovimentacao,
)
from sql.carteira_sql import (
    CRIAR_TABELA_CARTEIRA,
    CRIAR_TABELA_MOVIMENTACAO,
    INSERIR_CARTEIRA,
    OBTER_CARTEIRA_POR_USUARIO,
    OBTER_CARTEIRA_POR_ID,
    ATUALIZAR_SALDO,
    OBTER_RESUMO_CARTEIRA,
    INSERIR_MOVIMENTACAO,
    CONTAR_MOVIMENTACOES_POR_CARTEIRA,
    OBTER_MOVIMENTACOES_POR_CARTEIRA,
    RANKING,
)
from util.db_util import obter_conexao
from util.datetime_util import agora
from util.logger_config import logger
from util.paginacao_util import Paginacao, ITENS_POR_PAGINA_PADRAO

T = TypeVar("T", bound=Enum)


# =============================================================================
# Ranking
# =============================================================================

def ranking(limite: int = 50) -> list[dict]:
    """Retorna o ranking de apostadores ordenado por total ganho (desc).

    Cada item é um dict com: usuario_id, nome_usuario, total_apostado,
    total_ganho e lucro (total_ganho - total_apostado). A posição (1, 2, 3...)
    é atribuída aqui, pois a ordem já vem definida pelo ORDER BY do SQL.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(RANKING, (limite,))
        rows = cursor.fetchall()

    itens: list[dict] = []
    for posicao, row in enumerate(rows, start=1):
        total_apostado = round(row["total_apostado"] or 0.0, 2)
        total_ganho = round(row["total_ganho"] or 0.0, 2)
        itens.append(
            {
                "posicao": posicao,
                "usuario_id": row["usuario_id"],
                "nome_usuario": row["nome_usuario"],
                "total_apostado": total_apostado,
                "total_ganho": total_ganho,
                "lucro": round(total_ganho - total_apostado, 2),
            }
        )
    return itens


# =============================================================================
# Conversores de linha
# =============================================================================

def _converter_enum_seguro(valor: str, tipo_enum: Type[T], padrao: T) -> T:
    """Converte string para Enum de forma segura (log + padrão em falha)."""
    try:
        return tipo_enum(valor)
    except ValueError:
        logger.error(
            f"Valor inválido para {tipo_enum.__name__}: '{valor}'. "
            f"Usando padrão: {padrao.value}"
        )
        return padrao


def _row_to_carteira(row: sqlite3.Row) -> Carteira:
    return Carteira(
        id=row["id"],
        usuario_id=row["usuario_id"],
        saldo_ficticio=row["saldo_ficticio"],
        atualizado_em=row["atualizado_em"],
    )


def _row_to_movimentacao(row: sqlite3.Row) -> MovimentacaoFinanceira:
    return MovimentacaoFinanceira(
        id=row["id"],
        carteira_id=row["carteira_id"],
        aposta_id=row["aposta_id"],
        tipo=_converter_enum_seguro(
            row["tipo"], TipoMovimentacao, TipoMovimentacao.CREDITO_INICIAL
        ),
        valor=row["valor"],
        saldo_apos=row["saldo_apos"],
        descricao=row["descricao"],
        criado_em=row["criado_em"],
    )


# =============================================================================
# Criação de tabelas
# =============================================================================

def criar_tabela() -> bool:
    """Cria as tabelas carteira e movimentacao_financeira.

    A ordem importa: carteira primeiro (movimentacao referencia carteira).
    A FK de movimentacao para `aposta` só é validada com foreign_keys=ON e a
    tabela aposta criada antes; o módulo de apostas garante essa ordem em
    main.py. Como a criação é idempotente (IF NOT EXISTS), é seguro chamar.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_CARTEIRA)
        cursor.execute(CRIAR_TABELA_MOVIMENTACAO)
        return True


# =============================================================================
# Carteira
# =============================================================================

def criar_carteira(
    usuario_id: int,
    saldo_inicial: float = 0.0,
    conn: Optional[sqlite3.Connection] = None,
) -> Optional[int]:
    """Cria a carteira (1-para-1) de um usuário. Retorna o id criado.

    Quando ``conn`` é fornecido, participa da transação do chamador
    (ex.: cadastro de apostador que também credita o saldo inicial).
    """
    parametros = (usuario_id, saldo_inicial, agora())

    if conn is not None:
        cursor = conn.cursor()
        cursor.execute(INSERIR_CARTEIRA, parametros)
        return cursor.lastrowid

    with obter_conexao() as nova_conn:
        cursor = nova_conn.cursor()
        cursor.execute(INSERIR_CARTEIRA, parametros)
        return cursor.lastrowid


def obter_por_usuario(
    usuario_id: int,
    conn: Optional[sqlite3.Connection] = None,
) -> Optional[Carteira]:
    """Obtém a carteira de um usuário (sem o resumo agregado)."""
    if conn is not None:
        cursor = conn.cursor()
        cursor.execute(OBTER_CARTEIRA_POR_USUARIO, (usuario_id,))
        row = cursor.fetchone()
        return _row_to_carteira(row) if row else None

    with obter_conexao() as nova_conn:
        cursor = nova_conn.cursor()
        cursor.execute(OBTER_CARTEIRA_POR_USUARIO, (usuario_id,))
        row = cursor.fetchone()
        return _row_to_carteira(row) if row else None


def obter_por_id(
    carteira_id: int,
    conn: Optional[sqlite3.Connection] = None,
) -> Optional[Carteira]:
    """Obtém a carteira pelo seu id."""
    if conn is not None:
        cursor = conn.cursor()
        cursor.execute(OBTER_CARTEIRA_POR_ID, (carteira_id,))
        row = cursor.fetchone()
        return _row_to_carteira(row) if row else None

    with obter_conexao() as nova_conn:
        cursor = nova_conn.cursor()
        cursor.execute(OBTER_CARTEIRA_POR_ID, (carteira_id,))
        row = cursor.fetchone()
        return _row_to_carteira(row) if row else None


def obter_saldo(
    usuario_id: int,
    conn: Optional[sqlite3.Connection] = None,
) -> float:
    """Retorna o saldo atual da carteira do usuário (0.0 se inexistente)."""
    carteira = obter_por_usuario(usuario_id, conn=conn)
    return carteira.saldo_ficticio if carteira else 0.0


def atualizar_saldo(
    usuario_id: int,
    novo_saldo: float,
    conn: Optional[sqlite3.Connection] = None,
) -> bool:
    """Grava o novo saldo da carteira via UPDATE atômico.

    Levanta ValueError se ``novo_saldo`` for negativo — a regra de saldo nunca
    negativo é enforçada aqui, antes do UPDATE. O cálculo do novo saldo é
    responsabilidade do chamador (que deve estar dentro da mesma transação que
    validou o saldo anterior, usando ``conn`` + BEGIN IMMEDIATE).
    """
    if novo_saldo < 0:
        raise ValueError("Saldo da carteira não pode ficar negativo.")

    parametros = (round(novo_saldo, 2), agora(), usuario_id)

    if conn is not None:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_SALDO, parametros)
        return cursor.rowcount > 0

    with obter_conexao() as nova_conn:
        cursor = nova_conn.cursor()
        cursor.execute(ATUALIZAR_SALDO, parametros)
        return cursor.rowcount > 0


def obter_resumo(
    carteira_id: int,
    conn: Optional[sqlite3.Connection] = None,
) -> tuple[float, float]:
    """Retorna (total_apostado, total_ganho) agregados das movimentações."""
    if conn is not None:
        cursor = conn.cursor()
        cursor.execute(OBTER_RESUMO_CARTEIRA, (carteira_id,))
        row = cursor.fetchone()
    else:
        with obter_conexao() as nova_conn:
            cursor = nova_conn.cursor()
            cursor.execute(OBTER_RESUMO_CARTEIRA, (carteira_id,))
            row = cursor.fetchone()

    if not row:
        return 0.0, 0.0
    return (
        round(row["total_apostado"] or 0.0, 2),
        round(row["total_ganho"] or 0.0, 2),
    )


def obter_com_resumo(usuario_id: int) -> Optional[Carteira]:
    """Obtém a carteira do usuário já com total_apostado e total_ganho."""
    carteira = obter_por_usuario(usuario_id)
    if not carteira:
        return None
    total_apostado, total_ganho = obter_resumo(carteira.id)
    carteira.total_apostado = total_apostado
    carteira.total_ganho = total_ganho
    return carteira


# =============================================================================
# Movimentação financeira
# =============================================================================

def registrar_movimentacao(
    carteira_id: int,
    tipo: TipoMovimentacao,
    valor: float,
    saldo_apos: float,
    descricao: str,
    aposta_id: Optional[int] = None,
    conn: Optional[sqlite3.Connection] = None,
) -> Optional[int]:
    """Insere uma movimentação financeira (histórico imutável).

    ``valor`` é positivo para créditos e negativo para débitos. ``saldo_apos``
    é o saldo da carteira logo após esta movimentação. Aceita ``conn`` para
    participar da transação do chamador (aposta/liquidação).
    """
    parametros = (
        carteira_id,
        aposta_id,
        tipo.value,
        round(valor, 2),
        round(saldo_apos, 2),
        descricao,
        agora(),
    )

    if conn is not None:
        cursor = conn.cursor()
        cursor.execute(INSERIR_MOVIMENTACAO, parametros)
        return cursor.lastrowid

    with obter_conexao() as nova_conn:
        cursor = nova_conn.cursor()
        cursor.execute(INSERIR_MOVIMENTACAO, parametros)
        return cursor.lastrowid


def listar_por_usuario(
    usuario_id: int,
    pagina: int = 1,
    por_pagina: int = ITENS_POR_PAGINA_PADRAO,
) -> Paginacao:
    """Lista as movimentações da carteira do usuário (paginado, mais recentes
    primeiro). Retorna uma ``Paginacao`` cujos items são MovimentacaoFinanceira.
    """
    if por_pagina <= 0:
        por_pagina = ITENS_POR_PAGINA_PADRAO

    carteira = obter_por_usuario(usuario_id)
    if not carteira:
        return Paginacao(items=[], total=0, pagina_atual=1, por_pagina=por_pagina)

    with obter_conexao() as conn:
        cursor = conn.cursor()

        cursor.execute(CONTAR_MOVIMENTACOES_POR_CARTEIRA, (carteira.id,))
        row_count = cursor.fetchone()
        total = row_count["total"] if row_count else 0

        total_paginas = max(1, (total + por_pagina - 1) // por_pagina)
        pagina = max(1, min(pagina, total_paginas))
        offset = (pagina - 1) * por_pagina

        sql_paginado = f"{OBTER_MOVIMENTACOES_POR_CARTEIRA} LIMIT ? OFFSET ?"
        cursor.execute(sql_paginado, (carteira.id, por_pagina, offset))
        rows = cursor.fetchall()
        items = [_row_to_movimentacao(r) for r in rows]

    return Paginacao(
        items=items,
        total=total,
        pagina_atual=pagina,
        por_pagina=por_pagina,
    )
