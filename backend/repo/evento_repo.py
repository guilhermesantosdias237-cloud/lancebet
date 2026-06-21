"""
Repositório de eventos esportivos e opções de aposta (LanceBet).

Segue o padrão de camadas do projeto: Routes -> DTOs -> Repos -> SQL puro
(SQLite, sem ORM, prepared statements). Datas são gravadas via
``util.datetime_util.agora()``.

Este módulo expõe ``criar_tabela()`` que cria AMBAS as tabelas do módulo
(evento_esportivo e opcao_aposta), respeitando a ordem de dependência.

NOTA: a tabela ``opcao_aposta`` é referenciada pela tabela ``aposta`` (em
outro módulo). A criação da tabela aposta deve ocorrer DEPOIS de
``evento_repo.criar_tabela()`` — a ordem é controlada em ``main.py``.
"""

import sqlite3
from typing import Optional, Type, TypeVar
from enum import Enum

from model.evento_model import (
    EventoEsportivo,
    OpcaoAposta,
    StatusEvento,
    StatusOpcao,
)
from sql.evento_sql import (
    CRIAR_TABELA_EVENTO,
    INSERIR_EVENTO,
    OBTER_EVENTO_POR_ID,
    OBTER_EVENTOS_BASE,
    OBTER_EVENTOS_ORDER,
    ATUALIZAR_EVENTO,
    ATUALIZAR_STATUS_EVENTO,
    LIQUIDAR_EVENTO,
    CONTAR_EVENTOS_POR_STATUS,
    CRIAR_TABELA_OPCAO,
    INSERIR_OPCAO,
    OBTER_OPCAO_POR_ID,
    OBTER_OPCOES_POR_EVENTO,
    ATUALIZAR_ODD,
    ATUALIZAR_STATUS_OPCAO,
    MARCAR_VENCEDORA,
    ZERAR_VENCEDORAS_DO_EVENTO,
)
from util.db_util import obter_conexao
from util.datetime_util import agora
from util.logger_config import logger

T = TypeVar("T", bound=Enum)


def _converter_enum_seguro(valor: str, tipo_enum: Type[T], padrao: T) -> T:
    """Converte string para Enum de forma segura (loga e usa padrão se inválido)."""
    try:
        return tipo_enum(valor)
    except ValueError:
        logger.error(
            f"Valor inválido para {tipo_enum.__name__}: '{valor}'. "
            f"Usando padrão: {padrao.value}"
        )
        return padrao


# =============================================================================
# Mapeadores linha -> objeto
# =============================================================================

def _row_to_opcao(row: sqlite3.Row) -> OpcaoAposta:
    return OpcaoAposta(
        id=row["id"],
        evento_id=row["evento_id"],
        descricao=row["descricao"],
        sub=row["sub"],
        odd=row["odd"],
        status=_converter_enum_seguro(row["status"], StatusOpcao, StatusOpcao.ATIVA),
        vencedora=bool(row["vencedora"]),
    )


def _row_to_evento(row: sqlite3.Row) -> EventoEsportivo:
    return EventoEsportivo(
        id=row["id"],
        mandante=row["mandante"],
        visitante=row["visitante"],
        titulo=row["titulo"],
        esporte=row["esporte"],
        competicao=row["competicao"],
        data_hora=row["data_hora"],
        status=_converter_enum_seguro(row["status"], StatusEvento, StatusEvento.ABERTO),
        resultado_descricao=row["resultado_descricao"],
        criado_por=row["criado_por"],
        criado_em=row["criado_em"],
        opcoes=[],
    )


# =============================================================================
# Criação de tabelas
# =============================================================================

def criar_tabela() -> bool:
    """Cria as tabelas evento_esportivo e opcao_aposta (nesta ordem)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_EVENTO)
        cursor.execute(CRIAR_TABELA_OPCAO)
        return True


# =============================================================================
# Eventos
# =============================================================================

def criar(evento: EventoEsportivo) -> Optional[int]:
    """Insere um evento. O título é derivado de mandante x visitante.

    As opções embutidas em ``evento.opcoes`` também são inseridas, na mesma
    conexão/transação. Retorna o id do evento criado.
    """
    titulo = f"{evento.mandante} x {evento.visitante}"
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR_EVENTO,
            (
                evento.mandante,
                evento.visitante,
                titulo,
                evento.esporte,
                evento.competicao,
                evento.data_hora,
                evento.status.value,
                evento.resultado_descricao,
                evento.criado_por,
                agora(),
            ),
        )
        evento_id = cursor.lastrowid

        for opcao in evento.opcoes:
            cursor.execute(
                INSERIR_OPCAO,
                (
                    evento_id,
                    opcao.descricao,
                    opcao.sub,
                    opcao.odd,
                    opcao.status.value,
                    1 if opcao.vencedora else 0,
                ),
            )
        return evento_id


def obter_por_id(id: int) -> Optional[EventoEsportivo]:
    """Retorna o evento com suas opções embutidas, ou None."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_EVENTO_POR_ID, (id,))
        row = cursor.fetchone()
        if not row:
            return None
        evento = _row_to_evento(row)
        cursor.execute(OBTER_OPCOES_POR_EVENTO, (id,))
        evento.opcoes = [_row_to_opcao(r) for r in cursor.fetchall()]
        return evento


def listar(
    status: Optional[str] = None,
    esporte: Optional[str] = None,
    excluir_liquidados: bool = False,
) -> list[EventoEsportivo]:
    """Lista eventos com filtros opcionais, ordenados por criado_em DESC.

    Args:
        status: filtra por status exato (Aberto|Fechado|Liquidado).
        esporte: filtra por esporte exato.
        excluir_liquidados: quando True e ``status`` não informado, exclui
            eventos LIQUIDADO (usado nas rotas públicas / do apostador).

    Cada evento retornado já vem com suas opções embutidas. A paginação é
    aplicada na camada de rota (em memória via util.paginacao_util.paginar).
    """
    clausulas: list[str] = []
    params: list = []

    if status:
        clausulas.append("status = ?")
        params.append(status)
    elif excluir_liquidados:
        clausulas.append("status != ?")
        params.append(StatusEvento.LIQUIDADO.value)

    if esporte:
        clausulas.append("esporte = ?")
        params.append(esporte)

    sql = OBTER_EVENTOS_BASE
    if clausulas:
        sql += " WHERE " + " AND ".join(clausulas)
    sql += OBTER_EVENTOS_ORDER

    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        eventos = [_row_to_evento(r) for r in cursor.fetchall()]

        for evento in eventos:
            cursor.execute(OBTER_OPCOES_POR_EVENTO, (evento.id,))
            evento.opcoes = [_row_to_opcao(r) for r in cursor.fetchall()]

        return eventos


def atualizar(evento: EventoEsportivo) -> bool:
    """Atualiza dados básicos do evento (não altera status nem opções).

    O título é recalculado a partir de mandante/visitante.
    """
    titulo = f"{evento.mandante} x {evento.visitante}"
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR_EVENTO,
            (
                evento.mandante,
                evento.visitante,
                titulo,
                evento.esporte,
                evento.competicao,
                evento.data_hora,
                evento.id,
            ),
        )
        return cursor.rowcount > 0


def definir_status(id: int, status: str) -> bool:
    """Define o status do evento (Aberto|Fechado). Não use para liquidar."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_STATUS_EVENTO, (status, id))
        return cursor.rowcount > 0


def contar_por_status(status: str) -> int:
    """Conta eventos em um status específico (ex: Aberto para dashboard)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CONTAR_EVENTOS_POR_STATUS, (status,))
        row = cursor.fetchone()
        return row["total"] if row else 0


# =============================================================================
# Opções de aposta
# =============================================================================

def criar_opcao(opcao: OpcaoAposta) -> Optional[int]:
    """Insere uma nova opção de aposta em um evento. Retorna o id."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR_OPCAO,
            (
                opcao.evento_id,
                opcao.descricao,
                opcao.sub,
                opcao.odd,
                opcao.status.value,
                1 if opcao.vencedora else 0,
            ),
        )
        return cursor.lastrowid


def obter_opcao_por_id(id: int) -> Optional[OpcaoAposta]:
    """Retorna uma opção de aposta pelo id, ou None."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_OPCAO_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_opcao(row) if row else None


def listar_opcoes_por_evento(evento_id: int) -> list[OpcaoAposta]:
    """Lista todas as opções de aposta de um evento (ordem de inserção)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_OPCOES_POR_EVENTO, (evento_id,))
        return [_row_to_opcao(r) for r in cursor.fetchall()]


def atualizar_odd(id: int, odd: float) -> bool:
    """Atualiza a odd de uma opção. Não afeta apostas já registradas."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_ODD, (odd, id))
        return cursor.rowcount > 0


def alternar_status(id: int, status: str) -> bool:
    """Define o status (Ativa|Suspensa) de uma opção de aposta."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR_STATUS_OPCAO, (status, id))
        return cursor.rowcount > 0


def marcar_vencedora(evento_id: int, opcao_id: int) -> bool:
    """Marca uma única opção como vencedora, zerando as demais do evento.

    Executado em uma transação para garantir que exatamente uma opção do
    evento fique com vencedora=1.
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ZERAR_VENCEDORAS_DO_EVENTO, (evento_id,))
        cursor.execute(MARCAR_VENCEDORA, (1, opcao_id))
        return cursor.rowcount > 0
