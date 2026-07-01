"""Repositório de apostas do LanceBet.

Atomicidade (contrato canônico):
- ``criar_aposta`` roda numa única transação ``BEGIN IMMEDIATE`` (serializa
  escritas concorrentes no SQLite, que não tem SELECT FOR UPDATE): checa saldo,
  debita carteira, insere a aposta e registra a movimentação 'Aposta'.
- ``liquidar_evento`` roda numa única transação: marca a opção vencedora,
  define GANHOU/PERDEU em cada aposta ABERTA, credita o retorno aos vencedores
  (carteira + movimentação 'Ganho'), marca as apostas como LIQUIDADA e o evento
  como 'Liquidado'. Qualquer falha reverte tudo.

As operações de carteira/movimentação são executadas via SQL inline neste
módulo para manterem-se DENTRO da mesma conexão/transação — repos separados
abririam conexões próprias e quebrariam a atomicidade.
"""

import sqlite3
from typing import Optional, TypeVar, Type
from enum import Enum

from model.aposta_model import Aposta, StatusAposta, ResultadoAposta
from sql.aposta_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_POR_ID,
    OBTER_POR_USUARIO,
    CONTAR_POR_USUARIO,
    OBTER_TODAS_BASE,
    CONTAR_TODAS_BASE,
    ORDER_RECENTES,
    OBTER_ABERTAS_POR_EVENTO,
    OBTER_RECENTES,
    ATUALIZAR_LIQUIDACAO,
    ATUALIZAR_STATUS,
    SOMA_VOLUME_APOSTADO,
    CONTAR_PENDENTES,
    CONTAR_POR_EVENTO,
    SOMA_VOLUME_POR_EVENTO,
)
from util.db_util import obter_conexao, DATABASE_PATH, registrar_adaptadores
from util.datetime_util import agora
from util.logger_config import logger

T = TypeVar("T", bound=Enum)


# ---------------------------------------------------------------------------
# Erros de domínio (a rota traduz para HTTPException)
# ---------------------------------------------------------------------------

class ApostaError(Exception):
    """Erro de regra de negócio na criação/liquidação de apostas."""


class SaldoInsuficienteError(ApostaError):
    pass


class OpcaoIndisponivelError(ApostaError):
    pass


class EventoIndisponivelError(ApostaError):
    pass

class CancelamentoInvalidoError(ApostaError):
    """A aposta não pode ser cancelada (status/evento não permitem)."""

# ---------------------------------------------------------------------------
# Conversão de linhas
# ---------------------------------------------------------------------------

def _converter_enum_seguro(valor: str, tipo_enum: Type[T], padrao: T) -> T:
    try:
        return tipo_enum(valor)
    except ValueError:
        logger.error(
            f"Valor inválido para {tipo_enum.__name__}: '{valor}'. "
            f"Usando padrão: {padrao.value}"
        )
        return padrao


def _col(row: sqlite3.Row, nome: str):
    return row[nome] if nome in row.keys() else None


def _row_to_aposta(row: sqlite3.Row) -> Aposta:
    # Snapshots têm prioridade; cai no valor atual via JOIN se o snapshot for nulo.
    titulo_snapshot = _col(row, "titulo")
    titulo_join = _col(row, "titulo_evento_atual")
    opcao_snapshot = _col(row, "opcao_desc")
    opcao_join = _col(row, "opcao_descricao_atual")
    evento_id = _col(row, "evento_id")
    if evento_id is None:
        evento_id = _col(row, "evento_id_join")

    return Aposta(
        id=row["id"],
        usuario_id=row["usuario_id"],
        opcao_aposta_id=row["opcao_aposta_id"],
        valor_apostado=row["valor_apostado"],
        odd_registrada=row["odd_registrada"],
        retorno_potencial=row["retorno_potencial"],
        status=_converter_enum_seguro(
            row["status"], StatusAposta, StatusAposta.ABERTA
        ),
        resultado=_converter_enum_seguro(
            row["resultado"], ResultadoAposta, ResultadoAposta.PENDENTE
        ),
        criada_em=_col(row, "criada_em"),
        liquidada_em=_col(row, "liquidada_em"),
        evento_id=evento_id,
        titulo_evento=titulo_snapshot or titulo_join,
        descricao_opcao=opcao_snapshot or opcao_join,
        nome_usuario=_col(row, "nome_usuario"),
    )


# ---------------------------------------------------------------------------
# Criação de tabela
# ---------------------------------------------------------------------------

def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


# ---------------------------------------------------------------------------
# Helpers transacionais (operam sobre uma conexão já aberta)
# ---------------------------------------------------------------------------

def _abrir_conexao_imediata() -> sqlite3.Connection:
    """Conexão com BEGIN IMMEDIATE para serializar escritas concorrentes."""
    registrar_adaptadores()
    conn = sqlite3.connect(
        DATABASE_PATH,
        detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES,
        isolation_level=None,  # controle manual de transação
    )
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    conn.execute("BEGIN IMMEDIATE")
    return conn


def _carteira_do_usuario(conn: sqlite3.Connection, usuario_id: int) -> sqlite3.Row:
    cur = conn.execute(
        "SELECT id, saldo_ficticio FROM carteira WHERE usuario_id = ?",
        (usuario_id,),
    )
    return cur.fetchone()


def _ajustar_saldo(
    conn: sqlite3.Connection,
    carteira_id: int,
    novo_saldo: float,
    momento,
) -> None:
    conn.execute(
        "UPDATE carteira SET saldo_ficticio = ?, atualizado_em = ? WHERE id = ?",
        (round(novo_saldo, 2), momento, carteira_id),
    )


def _inserir_movimentacao(
    conn: sqlite3.Connection,
    carteira_id: int,
    aposta_id: Optional[int],
    tipo: str,
    valor: float,
    saldo_apos: float,
    descricao: str,
    momento,
) -> None:
    conn.execute(
        """
        INSERT INTO movimentacao_financeira
            (carteira_id, aposta_id, tipo, valor, saldo_apos, descricao, criado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (carteira_id, aposta_id, tipo, round(valor, 2), round(saldo_apos, 2), descricao, momento),
    )


# ---------------------------------------------------------------------------
# Criar aposta (transação atômica)
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Cancelar aposta (transação atômica)
# ---------------------------------------------------------------------------

def cancelar_aposta(aposta_id: int, usuario_id: int) -> tuple[Aposta, float]:
    """Cancela uma aposta ABERTA de um evento ABERTO e estorna o valor.

    Em transação atômica: valida que a aposta é do usuário, está 'Aberta' e que
    o evento ainda está 'Aberto'; credita o valor de volta na carteira; registra
        a movimentação 'Estorno' (valor positivo); muda o status para 'Cancelada'.

    Returns:
        (aposta_cancelada, saldo_apos)

    Raises:
        CancelamentoInvalidoError, ApostaError
    """
    momento = agora()
    conn = _abrir_conexao_imediata()
    try:
        # Carrega a aposta + o status do evento (via opção)
        cur = conn.execute(
            """
            SELECT a.id            AS aposta_id,
                   a.usuario_id    AS usuario_id,
                   a.valor_apostado AS valor_apostado,
                   a.status        AS aposta_status,
                   a.titulo        AS titulo_evento,
                   e.status        AS evento_status
            FROM aposta a
            LEFT JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
            LEFT JOIN evento_esportivo e ON o.evento_id = e.id
            WHERE a.id = ?
            """,
            (aposta_id,),
        )
        ap = cur.fetchone()
        if ap is None:
            raise ApostaError("Aposta não encontrada.")
        if ap["usuario_id"] != usuario_id:
            raise CancelamentoInvalidoError("Esta aposta não pertence a você.")
        if ap["aposta_status"] != StatusAposta.ABERTA.value:
            raise CancelamentoInvalidoError("Só é possível cancelar apostas em aberto.")
        if ap["evento_status"] != "Aberto":
            raise CancelamentoInvalidoError(
                "Não é possível cancelar: o evento não está mais aberto."
            )

        carteira = _carteira_do_usuario(conn, usuario_id)
        if carteira is None:
            raise ApostaError("Carteira do usuário não encontrada.")

        valor = float(ap["valor_apostado"])
        saldo_apos = round(float(carteira["saldo_ficticio"]) + valor, 2)

        # Credita de volta na carteira
        _ajustar_saldo(conn, carteira["id"], saldo_apos, momento)

        # Registra a movimentação de estorno (crédito, valor positivo)
        _inserir_movimentacao(
            conn,
            carteira_id=carteira["id"],
            aposta_id=aposta_id,
            tipo="Estorno",
            valor=valor,
            saldo_apos=saldo_apos,
            descricao=f"Estorno de aposta cancelada — {ap['titulo_evento']}"
            if ap["titulo_evento"]
            else "Estorno de aposta cancelada",
            momento=momento,
        )

        # Muda o status da aposta para Cancelada
        conn.execute(ATUALIZAR_STATUS, (StatusAposta.CANCELADA.value, aposta_id))

        conn.execute("COMMIT")
    except Exception:
        conn.execute("ROLLBACK")
        conn.close()
        raise
    conn.close()

    aposta = obter_por_id(aposta_id)
    if aposta is None:
        raise ApostaError("Falha ao cancelar a aposta.")
    return aposta, saldo_apos


# ---------------------------------------------------------------------------
# Liquidação de evento (transação atômica)
# ---------------------------------------------------------------------------

def liquidar_evento(
    evento_id: int,
    opcao_vencedora_id: int,
    descricao: str = "",
) -> dict:
    """Liquida um evento processando todas as apostas ABERTA.

    Em transação atômica: marca a opção vencedora (vencedora=1), define
    GANHOU/PERDEU em cada aposta ABERTA do evento, credita o retorno aos
    vencedores (carteira + movimentação 'Ganho'), marca todas as apostas como
    LIQUIDADA e o evento como 'Liquidado' com a descrição do resultado.

    Returns:
        {
          "apostas_liquidadas": int,
          "apostas_ganhadoras": int,
          "total_pago": float,
        }

    Raises:
        ApostaError em caso de evento/opção inválidos.
    """
    momento = agora()
    conn = _abrir_conexao_imediata()
    try:
        # Validar evento
        cur = conn.execute(
            "SELECT id, status FROM evento_esportivo WHERE id = ?", (evento_id,)
        )
        evento = cur.fetchone()
        if evento is None:
            raise ApostaError("Evento não encontrado.")
        if evento["status"] == "Liquidado":
            raise ApostaError("Este evento já foi liquidado.")

        # Validar opção vencedora pertence ao evento
        cur = conn.execute(
            "SELECT id, evento_id FROM opcao_aposta WHERE id = ?",
            (opcao_vencedora_id,),
        )
        opcao_venc = cur.fetchone()
        if opcao_venc is None or opcao_venc["evento_id"] != evento_id:
            raise ApostaError("Opção vencedora inválida para este evento.")

        # Marcar opção vencedora (zera as demais por segurança)
        conn.execute(
            "UPDATE opcao_aposta SET vencedora = 0 WHERE evento_id = ?",
            (evento_id,),
        )
        conn.execute(
            "UPDATE opcao_aposta SET vencedora = 1 WHERE id = ?",
            (opcao_vencedora_id,),
        )

        # Apostas ABERTA do evento
        cur = conn.execute(OBTER_ABERTAS_POR_EVENTO, (evento_id,))
        apostas = cur.fetchall()

        apostas_liquidadas = 0
        apostas_ganhadoras = 0
        total_pago = 0.0

        for ap in apostas:
            ganhou = ap["opcao_aposta_id"] == opcao_vencedora_id
            resultado = (
                ResultadoAposta.GANHOU.value if ganhou else ResultadoAposta.PERDEU.value
            )

            if ganhou:
                carteira = _carteira_do_usuario(conn, ap["usuario_id"])
                if carteira is not None:
                    retorno = float(ap["retorno_potencial"])
                    saldo_apos = round(float(carteira["saldo_ficticio"]) + retorno, 2)
                    _ajustar_saldo(conn, carteira["id"], saldo_apos, momento)
                    _inserir_movimentacao(
                        conn,
                        carteira_id=carteira["id"],
                        aposta_id=ap["id"],
                        tipo="Ganho",
                        valor=retorno,
                        saldo_apos=saldo_apos,
                        descricao=f"Ganho em {ap['titulo_evento_atual']}"
                        if ap["titulo_evento_atual"]
                        else "Ganho em aposta",
                        momento=momento,
                    )
                    total_pago += retorno
                apostas_ganhadoras += 1

            conn.execute(
                ATUALIZAR_LIQUIDACAO,
                (StatusAposta.LIQUIDADA.value, resultado, momento, ap["id"]),
            )
            apostas_liquidadas += 1

        # Atualizar evento
        conn.execute(
            "UPDATE evento_esportivo SET status = ?, resultado_descricao = ? WHERE id = ?",
            ("Liquidado", descricao or "", evento_id),
        )

        conn.execute("COMMIT")
    except Exception:
        conn.execute("ROLLBACK")
        conn.close()
        raise
    conn.close()

    return {
        "apostas_liquidadas": apostas_liquidadas,
        "apostas_ganhadoras": apostas_ganhadoras,
        "total_pago": round(total_pago, 2),
    }


# ---------------------------------------------------------------------------
# Leituras
# ---------------------------------------------------------------------------

def obter_por_id(id: int) -> Optional[Aposta]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_aposta(row) if row else None


def listar_minhas(
    usuario_id: int,
    status: Optional[str] = None,
) -> list[Aposta]:
    """Lista todas as apostas do usuário (filtro de status opcional em memória)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_USUARIO, (usuario_id,))
        rows = cursor.fetchall()
        apostas = [_row_to_aposta(r) for r in rows]
    if status:
        apostas = [a for a in apostas if a.status.value == status]
    return apostas


def listar_todas(
    status: Optional[str] = None,
    usuario_id: Optional[int] = None,
    evento_id: Optional[int] = None,
) -> list[Aposta]:
    """Lista todas as apostas (admin) com filtros opcionais."""
    where: list[str] = []
    params: list = []
    if status:
        where.append("a.status = ?")
        params.append(status)
    if usuario_id is not None:
        where.append("a.usuario_id = ?")
        params.append(usuario_id)
    if evento_id is not None:
        where.append("o.evento_id = ?")
        params.append(evento_id)

    sql = OBTER_TODAS_BASE
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += ORDER_RECENTES

    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        return [_row_to_aposta(r) for r in rows]


def listar_recentes(limite: int = 10) -> list[Aposta]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_RECENTES, (limite,))
        rows = cursor.fetchall()
        return [_row_to_aposta(r) for r in rows]


# ---------------------------------------------------------------------------
# Agregados (admin dashboard / por evento)
# ---------------------------------------------------------------------------

def volume_apostado_total() -> float:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(SOMA_VOLUME_APOSTADO)
        row = cursor.fetchone()
        return float(row["total"]) if row else 0.0


def contar_pendentes() -> int:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CONTAR_PENDENTES)
        row = cursor.fetchone()
        return row["total"] if row else 0


def contar_por_evento(evento_id: int) -> int:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CONTAR_POR_EVENTO, (evento_id,))
        row = cursor.fetchone()
        return row["total"] if row else 0


def volume_por_evento(evento_id: int) -> float:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(SOMA_VOLUME_POR_EVENTO, (evento_id,))
        row = cursor.fetchone()
        return float(row["total"]) if row else 0.0


def contar_por_usuario(usuario_id: int) -> int:
    """Total de apostas de um usuário (todos os status)."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) AS total FROM aposta WHERE usuario_id = ?",
            (usuario_id,),
        )
        row = cursor.fetchone()
        return row["total"] if row else 0
