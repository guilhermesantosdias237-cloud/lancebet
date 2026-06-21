"""
SQL puro do módulo de eventos esportivos (evento_esportivo + opcao_aposta).

Todas as queries usam prepared statements (placeholders ``?``). O título
do evento é gerado no repositório como ``mandante + ' x ' + visitante``.
"""

# ===== EVENTO ESPORTIVO =====

CRIAR_TABELA_EVENTO = """
CREATE TABLE IF NOT EXISTS evento_esportivo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mandante TEXT NOT NULL,
    visitante TEXT NOT NULL,
    titulo TEXT NOT NULL,
    esporte TEXT NOT NULL DEFAULT 'Futebol',
    competicao TEXT NOT NULL DEFAULT 'Brasileirão Série A',
    data_hora TEXT,
    status TEXT NOT NULL DEFAULT 'Aberto',
    resultado_descricao TEXT,
    criado_por INTEGER NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES usuario(id)
)
"""

INSERIR_EVENTO = """
INSERT INTO evento_esportivo
    (mandante, visitante, titulo, esporte, competicao, data_hora, status,
     resultado_descricao, criado_por, criado_em)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

OBTER_EVENTO_POR_ID = """
SELECT *
FROM evento_esportivo
WHERE id = ?
"""

# Listagem com filtros opcionais. Os filtros são montados dinamicamente no
# repositório; estas são as cláusulas base.
OBTER_EVENTOS_BASE = """
SELECT *
FROM evento_esportivo
"""

OBTER_EVENTOS_ORDER = " ORDER BY criado_em DESC, id DESC"

ATUALIZAR_EVENTO = """
UPDATE evento_esportivo
SET mandante = ?, visitante = ?, titulo = ?, esporte = ?, competicao = ?,
    data_hora = ?
WHERE id = ?
"""

ATUALIZAR_STATUS_EVENTO = """
UPDATE evento_esportivo
SET status = ?
WHERE id = ?
"""

LIQUIDAR_EVENTO = """
UPDATE evento_esportivo
SET status = 'Liquidado', resultado_descricao = ?
WHERE id = ?
"""

CONTAR_EVENTOS_POR_STATUS = """
SELECT COUNT(*) as total
FROM evento_esportivo
WHERE status = ?
"""

# ===== OPCAO DE APOSTA =====

CRIAR_TABELA_OPCAO = """
CREATE TABLE IF NOT EXISTS opcao_aposta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    sub TEXT NOT NULL DEFAULT 'Mercado',
    odd REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativa',
    vencedora INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (evento_id) REFERENCES evento_esportivo(id) ON DELETE CASCADE
)
"""

INSERIR_OPCAO = """
INSERT INTO opcao_aposta (evento_id, descricao, sub, odd, status, vencedora)
VALUES (?, ?, ?, ?, ?, ?)
"""

OBTER_OPCAO_POR_ID = """
SELECT *
FROM opcao_aposta
WHERE id = ?
"""

OBTER_OPCOES_POR_EVENTO = """
SELECT *
FROM opcao_aposta
WHERE evento_id = ?
ORDER BY id ASC
"""

ATUALIZAR_ODD = """
UPDATE opcao_aposta
SET odd = ?
WHERE id = ?
"""

ATUALIZAR_STATUS_OPCAO = """
UPDATE opcao_aposta
SET status = ?
WHERE id = ?
"""

MARCAR_VENCEDORA = """
UPDATE opcao_aposta
SET vencedora = ?
WHERE id = ?
"""

# Zera o flag vencedora de todas as opções de um evento (antes de liquidar)
ZERAR_VENCEDORAS_DO_EVENTO = """
UPDATE opcao_aposta
SET vencedora = 0
WHERE evento_id = ?
"""
