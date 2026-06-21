CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL DEFAULT 'Apostador',
    cpf TEXT UNIQUE,
    data_nascimento TEXT,
    status TEXT NOT NULL DEFAULT 'Ativo',
    token_redefinicao TEXT,
    data_token TIMESTAMP,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP
)
"""

# Migrações idempotentes para bancos já existentes criados antes do MVP LanceBet.
# SQLite não adiciona colunas via "CREATE TABLE IF NOT EXISTS" quando a tabela já
# existe, então as novas colunas são acrescentadas por ALTER TABLE protegido por
# checagem de existência no repo (criar_tabela). UNIQUE não é aplicável em
# ALTER TABLE ADD COLUMN; a unicidade do cpf é garantida no schema novo e via
# índice abaixo.
MIGRAR_COLUNAS = [
    ("cpf", "ALTER TABLE usuario ADD COLUMN cpf TEXT"),
    ("data_nascimento", "ALTER TABLE usuario ADD COLUMN data_nascimento TEXT"),
    ("status", "ALTER TABLE usuario ADD COLUMN status TEXT NOT NULL DEFAULT 'Ativo'"),
]

CRIAR_INDICE_CPF = (
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_cpf "
    "ON usuario(cpf) WHERE cpf IS NOT NULL"
)

OBTER_COLUNAS = "PRAGMA table_info(usuario)"

INSERIR = """
INSERT INTO usuario (nome, email, senha, perfil, cpf, data_nascimento, status)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""

ALTERAR = """
UPDATE usuario
SET nome = ?, email = ?, perfil = ?, cpf = ?, data_nascimento = ?,
    data_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?
"""

ATUALIZAR_STATUS = """
UPDATE usuario
SET status = ?, data_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?
"""

ALTERAR_SENHA = """
UPDATE usuario
SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?
"""

EXCLUIR = "DELETE FROM usuario WHERE id = ?"

OBTER_POR_ID = "SELECT * FROM usuario WHERE id = ?"

OBTER_TODOS = "SELECT * FROM usuario ORDER BY nome"

OBTER_QUANTIDADE = "SELECT COUNT(*) as quantidade FROM usuario"

OBTER_POR_EMAIL = "SELECT * FROM usuario WHERE email = ?"

OBTER_POR_CPF = "SELECT * FROM usuario WHERE cpf = ?"

# Login dual: identificador pode ser e-mail OU CPF. O CPF é normalizado
# (somente dígitos) tanto no parâmetro quanto na coluna, removendo pontos e
# traços, antes da comparação. A comparação de e-mail é case-insensitive.
OBTER_POR_EMAIL_OU_CPF = """
SELECT * FROM usuario
WHERE LOWER(email) = LOWER(?)
   OR (cpf IS NOT NULL
       AND REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?)
"""

ATUALIZAR_TOKEN = """
UPDATE usuario
SET token_redefinicao = ?, data_token = ?
WHERE email = ?
"""

OBTER_POR_TOKEN = """
SELECT * FROM usuario
WHERE token_redefinicao = ?
"""

LIMPAR_TOKEN = """
UPDATE usuario
SET token_redefinicao = NULL, data_token = NULL
WHERE id = ?
"""

OBTER_TODOS_POR_PERFIL = """
SELECT * FROM usuario
WHERE perfil = ?
ORDER BY nome
"""

BUSCAR_POR_TERMO = """
SELECT id, nome, email, senha, perfil,
       cpf, data_nascimento, status,
       token_redefinicao, data_token,
       data_cadastro AS "data_cadastro [timestamp]",
       data_atualizacao AS "data_atualizacao [timestamp]"
FROM usuario
WHERE (LOWER(nome) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))
LIMIT ?
"""
