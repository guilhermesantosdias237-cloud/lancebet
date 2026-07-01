CRIAR_TABELA_PARTICIPANTE = """
CREATE TABLE IF NOT EXISTS participante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    escudo_url TEXT,
    esporte TEXT NOT NULL DEFAULT 'Futebol',
    ativo INTEGER NOT NULL DEFAULT 1
)
"""

INSERIR_PARTICIPANTE = """
INSERT INTO participante (nome, escudo_url, esporte, ativo)
VALUES (?, ?, ?, ?)
"""

OBTER_PARTICIPANTE_POR_ID = """
SELECT *
FROM participante
WHERE id = ?
"""

OBTER_PARTICIPANTES_BASE = """
SELECT *
FROM participante
"""

OBTER_PARTICIPANTES_ORDER = " ORDER BY nome ASC"

ATUALIZAR_PARTICIPANTE = """
UPDATE participante
SET nome = ?, escudo_url = ?, esporte = ?, ativo = ?
WHERE id = ?
"""

EXCLUIR_PARTICIPANTE = """
DELETE FROM participante
WHERE id = ?
"""