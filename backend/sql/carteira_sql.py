"""SQL do módulo financeiro: carteira + movimentacao_financeira.

A tabela `carteira` tem relação 1-para-1 com `usuario`. O `saldo_ficticio`
nunca pode ficar negativo (enforce no repo antes do UPDATE). Toda atualização
de saldo usa UPDATE atômico (nunca ler-somar-escrever fora de transação).

A tabela `movimentacao_financeira` registra o histórico imutável de créditos
(valor positivo) e débitos (valor negativo) sobre uma carteira.
"""

# =============================================================================
# carteira
# =============================================================================

CRIAR_TABELA_CARTEIRA = """
CREATE TABLE IF NOT EXISTS carteira (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE NOT NULL,
    saldo_ficticio REAL NOT NULL DEFAULT 0.0,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
)
"""

INSERIR_CARTEIRA = """
INSERT INTO carteira (usuario_id, saldo_ficticio, atualizado_em)
VALUES (?, ?, ?)
"""

OBTER_CARTEIRA_POR_USUARIO = """
SELECT id, usuario_id, saldo_ficticio, atualizado_em
FROM carteira
WHERE usuario_id = ?
"""

OBTER_CARTEIRA_POR_ID = """
SELECT id, usuario_id, saldo_ficticio, atualizado_em
FROM carteira
WHERE id = ?
"""

# UPDATE atômico de saldo: grava o novo saldo já calculado pelo chamador
# dentro da mesma conexão/transação que validou o saldo anterior.
ATUALIZAR_SALDO = """
UPDATE carteira
SET saldo_ficticio = ?, atualizado_em = ?
WHERE usuario_id = ?
"""

# Resumo agregado da carteira (total apostado e total ganho) a partir das
# movimentações. total_apostado é a soma dos débitos de aposta (em valor
# absoluto); total_ganho é a soma dos créditos de ganho.
OBTER_RESUMO_CARTEIRA = """
SELECT
    COALESCE(SUM(CASE WHEN tipo = 'Aposta' THEN -valor ELSE 0 END), 0.0) AS total_apostado,
    COALESCE(SUM(CASE WHEN tipo = 'Ganho' THEN valor ELSE 0 END), 0.0) AS total_ganho
FROM movimentacao_financeira
WHERE carteira_id = ?
"""

# =============================================================================
# movimentacao_financeira
# =============================================================================

CRIAR_TABELA_MOVIMENTACAO = """
CREATE TABLE IF NOT EXISTS movimentacao_financeira (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carteira_id INTEGER NOT NULL,
    aposta_id INTEGER,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    saldo_apos REAL NOT NULL,
    descricao TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carteira_id) REFERENCES carteira(id) ON DELETE CASCADE,
    FOREIGN KEY (aposta_id) REFERENCES aposta(id) ON DELETE SET NULL
)
"""

INSERIR_MOVIMENTACAO = """
INSERT INTO movimentacao_financeira
    (carteira_id, aposta_id, tipo, valor, saldo_apos, descricao, criado_em)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""

CONTAR_MOVIMENTACOES_POR_CARTEIRA = """
SELECT COUNT(*) AS total
FROM movimentacao_financeira
WHERE carteira_id = ?
"""

OBTER_MOVIMENTACOES_POR_CARTEIRA = """
SELECT id, carteira_id, aposta_id, tipo, valor, saldo_apos, descricao, criado_em
FROM movimentacao_financeira
WHERE carteira_id = ?
ORDER BY criado_em DESC, id DESC
"""
