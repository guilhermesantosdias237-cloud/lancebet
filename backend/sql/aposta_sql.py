"""SQL puro do módulo de apostas (LanceBet).

Tabela ``aposta`` com snapshots desnormalizados (evento_id, titulo, opcao_desc)
para exibição sem JOINs custosos, além de odd_registrada (snapshot da odd no
momento da aposta) e retorno_potencial pré-calculado.
"""

CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS aposta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    opcao_aposta_id INTEGER NOT NULL,
    evento_id INTEGER,
    titulo TEXT,
    opcao_desc TEXT,
    valor_apostado REAL NOT NULL,
    odd_registrada REAL NOT NULL,
    retorno_potencial REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aberta',
    resultado TEXT NOT NULL DEFAULT 'Pendente',
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    liquidada_em TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (opcao_aposta_id) REFERENCES opcao_aposta(id)
)
"""

INSERIR = """
INSERT INTO aposta (
    usuario_id, opcao_aposta_id, evento_id, titulo, opcao_desc,
    valor_apostado, odd_registrada, retorno_potencial, status, resultado, criada_em
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

# Detalhe de uma aposta com dados desnormalizados via JOIN (fallback aos snapshots)
OBTER_POR_ID = """
SELECT a.*,
       u.nome AS nome_usuario,
       o.descricao AS opcao_descricao_atual,
       e.id AS evento_id_join,
       e.titulo AS titulo_evento_atual
FROM aposta a
INNER JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
LEFT JOIN evento_esportivo e ON o.evento_id = e.id
WHERE a.id = ?
"""

# Apostas de um usuário (base; filtros e paginação aplicados na camada de paginação)
OBTER_POR_USUARIO = """
SELECT a.*,
       u.nome AS nome_usuario,
       o.descricao AS opcao_descricao_atual,
       e.id AS evento_id_join,
       e.titulo AS titulo_evento_atual
FROM aposta a
INNER JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
LEFT JOIN evento_esportivo e ON o.evento_id = e.id
WHERE a.usuario_id = ?
ORDER BY a.criada_em DESC, a.id DESC
"""

CONTAR_POR_USUARIO = """
SELECT COUNT(*) AS total
FROM aposta
WHERE usuario_id = ?
"""

# Todas as apostas (admin); filtros opcionais aplicados via WHERE dinâmico
OBTER_TODAS_BASE = """
SELECT a.*,
       u.nome AS nome_usuario,
       o.descricao AS opcao_descricao_atual,
       e.id AS evento_id_join,
       e.titulo AS titulo_evento_atual
FROM aposta a
INNER JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
LEFT JOIN evento_esportivo e ON o.evento_id = e.id
"""

CONTAR_TODAS_BASE = """
SELECT COUNT(*) AS total
FROM aposta a
"""

ORDER_RECENTES = " ORDER BY a.criada_em DESC, a.id DESC"

# Apostas ABERTA de um evento (para liquidação)
OBTER_ABERTAS_POR_EVENTO = """
SELECT a.*,
       u.nome AS nome_usuario,
       o.descricao AS opcao_descricao_atual,
       o.evento_id AS evento_id_join,
       e.titulo AS titulo_evento_atual
FROM aposta a
INNER JOIN usuario u ON a.usuario_id = u.id
INNER JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
LEFT JOIN evento_esportivo e ON o.evento_id = e.id
WHERE o.evento_id = ? AND a.status = 'Aberta'
"""

# Apostas recentes (admin dashboard)
OBTER_RECENTES = """
SELECT a.*,
       u.nome AS nome_usuario,
       o.descricao AS opcao_descricao_atual,
       e.id AS evento_id_join,
       e.titulo AS titulo_evento_atual
FROM aposta a
INNER JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
LEFT JOIN evento_esportivo e ON o.evento_id = e.id
ORDER BY a.criada_em DESC, a.id DESC
LIMIT ?
"""

# --- Mutações usadas dentro de transações (recebem a conexão de fora) ---

ATUALIZAR_LIQUIDACAO = """
UPDATE aposta
SET status = ?, resultado = ?, liquidada_em = ?
WHERE id = ?
"""
# Atualiza apenas o status de uma aposta (ex.: cancelamento -> 'Cancelada')
ATUALIZAR_STATUS = """
UPDATE aposta
SET status = ?
WHERE id = ?
"""

# --- Agregados (admin dashboard) ---

SOMA_VOLUME_APOSTADO = """
SELECT COALESCE(SUM(valor_apostado), 0) AS total
FROM aposta
"""

CONTAR_PENDENTES = """
SELECT COUNT(*) AS total
FROM aposta
WHERE status = 'Aberta'
"""

CONTAR_POR_EVENTO = """
SELECT COUNT(*) AS total
FROM aposta a
INNER JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
WHERE o.evento_id = ?
"""

SOMA_VOLUME_POR_EVENTO = """
SELECT COALESCE(SUM(a.valor_apostado), 0) AS total
FROM aposta a
INNER JOIN opcao_aposta o ON a.opcao_aposta_id = o.id
WHERE o.evento_id = ?
"""
