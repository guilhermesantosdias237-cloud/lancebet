import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

from PIL import Image, UnidentifiedImageError

from repo import usuario_repo
from model.usuario_model import Usuario
from util.security import criar_hash_senha
from util.logger_config import logger
from util.perfis import Perfil
from util.db_util import obter_conexao
from util.datetime_util import agora
from util.foto_util import obter_path_absoluto_foto

# Caminho do arquivo de seed de usuários (raiz_do_projeto/data/usuarios_seed.json).
# Este arquivo é gerado/atualizado pelo scripts/configurar_projeto.py.
CAMINHO_SEED_USUARIOS = Path(__file__).resolve().parent.parent / "data" / "usuarios_seed.json"

# Pasta com as imagens fictícias geradas (avatares, escudos, banners).
PASTA_SEED_IMG = Path(__file__).resolve().parent.parent / "static" / "img" / "seed"


def _ler_usuarios_do_json() -> list[dict]:
    """
    Lê os usuários definidos em data/usuarios_seed.json.

    Returns:
        Lista de dicionários de usuários. Retorna lista vazia se o arquivo
        não existir, estiver vazio ou for inválido.
    """
    if not CAMINHO_SEED_USUARIOS.exists():
        return []
    try:
        dados = json.loads(CAMINHO_SEED_USUARIOS.read_text(encoding="utf-8"))
        return dados.get("usuarios", [])
    except (json.JSONDecodeError, OSError) as e:
        logger.error(
            f"Erro ao ler {CAMINHO_SEED_USUARIOS.name}: {e}. "
            "Usando perfis do enum como fallback."
        )
        return []


def _gerar_usuarios_dos_perfis() -> list[dict]:
    """
    Gera um usuário padrão para cada perfil do enum Perfil (fallback).

    Formato gerado por perfil:
    - nome: {Perfil} Padrão
    - email: padrao@{perfil}.com
    - senha: 1234aA@#
    - perfil: {Perfil}
    """
    usuarios = []
    for perfil_enum in Perfil:
        perfil_valor = perfil_enum.value
        usuarios.append({
            "nome": f"{perfil_valor} Padrão",
            "email": f"padrao@{perfil_valor.lower()}.com",
            "senha": "1234aA@#",
            "perfil": perfil_valor,
        })
    return usuarios


def carregar_usuarios_seed():
    """
    Carrega usuários padrão no banco de dados.

    Prioriza os usuários definidos em data/usuarios_seed.json (gerado pelo
    scripts/configurar_projeto.py). Caso o arquivo não exista ou esteja vazio/inválido,
    gera automaticamente 1 usuário para cada perfil do enum Perfil como fallback.

    Só insere usuários se não houver nenhum usuário cadastrado no banco.
    A senha de cada usuário é sempre armazenada com hash bcrypt.
    """
    # Verificar se já existem usuários cadastrados
    quantidade_usuarios = usuario_repo.obter_quantidade()
    if quantidade_usuarios > 0:
        logger.info(f"Já existem {quantidade_usuarios} usuários cadastrados. Seed não será executado.")
        return

    usuarios_seed = _ler_usuarios_do_json()
    if usuarios_seed:
        logger.info(
            f"Nenhum usuário encontrado. Carregando {len(usuarios_seed)} usuário(s) "
            f"de {CAMINHO_SEED_USUARIOS.name}..."
        )
    else:
        usuarios_seed = _gerar_usuarios_dos_perfis()
        logger.info(
            "Nenhum usuário encontrado e seed JSON ausente/vazio. "
            "Gerando usuários padrão a partir dos perfis..."
        )

    usuarios_criados = 0
    usuarios_com_erro = 0

    for dados in usuarios_seed:
        email = dados.get("email", "")
        try:
            usuario = Usuario(
                id=0,
                nome=dados.get("nome", ""),
                email=email,
                senha=criar_hash_senha(dados.get("senha", "")),
                perfil=dados.get("perfil", ""),
                cpf=dados.get("cpf") or None,
                data_nascimento=dados.get("data_nascimento") or None,
                status=dados.get("status") or "Ativo",
            )

            usuario_id = usuario_repo.inserir(usuario)
            if usuario_id:
                logger.info(f"✓ Usuário {email} criado com sucesso (ID: {usuario_id})")
                usuarios_criados += 1
            else:
                logger.error(f"✗ Falha ao inserir usuário {email} no banco")
                usuarios_com_erro += 1

        except sqlite3.Error as e:
            logger.error(f"✗ Erro ao processar usuário {email}: {e}")
            usuarios_com_erro += 1

    # Resumo
    logger.info(f"Resumo do seed de usuários: {usuarios_criados} criados, {usuarios_com_erro} com erro")


# =============================================================================
# Seed fictício do LanceBet (apostadores, carteiras, eventos, apostas, ledger)
# =============================================================================

# Senha padrão dos apostadores fictícios (texto plano; será hasheada com bcrypt).
SENHA_PADRAO_APOSTADOR = "123456"

# Apostadores fictícios. O Admin Lance vem de usuarios_seed.json (não duplicar).
# data_nascimento em ISO 8601 (YYYY-MM-DD). status em {Ativo, Bloqueado}.
APOSTADORES_SEED = [
    {
        "chave": "joao",
        "nome": "João Silva",
        "email": "joao@email.com",
        "cpf": "111.111.111-11",
        "data_nascimento": "1995-03-12",
        "status": "Ativo",
        "avatar": "avatar_joao.png",
    },
    {
        "chave": "marina",
        "nome": "Marina Costa",
        "email": "marina@email.com",
        "cpf": "222.222.222-22",
        "data_nascimento": "2000-07-25",
        "status": "Ativo",
        "avatar": "avatar_marina.png",
    },
    {
        "chave": "pedro",
        "nome": "Pedro Alves",
        "email": "pedro@email.com",
        "cpf": "333.333.333-33",
        "data_nascimento": "1998-11-10",
        "status": "Bloqueado",
        "avatar": "avatar_pedro.png",
    },
    {
        "chave": "bianca",
        "nome": "Bianca Ramos",
        "email": "bianca@email.com",
        "cpf": "444.444.444-44",
        "data_nascimento": "2002-09-03",
        "status": "Ativo",
        "avatar": "avatar_extra.png",
    },
]

# Eventos do protótipo (clubes reais, mesmas odds/status). Cada opção carrega
# uma chave estável ("ref") para ligar apostas sem depender de ids gerados.
# escudo: arquivo na pasta seed (apenas referência/documentação; o schema atual
# não tem coluna de imagem de evento — associação ignorada graciosamente).
EVENTOS_SEED = [
    {
        "ref": "fla_pal",
        "mandante": "Flamengo",
        "visitante": "Palmeiras",
        "competicao": "Brasileirão Série A",
        "data_hora": "Sáb · 20 jun · 16:00",
        "status": "Aberto",
        "resultado_descricao": "",
        "escudo_mandante": "escudo_flamengo.png",
        "escudo_visitante": "escudo_palmeiras.png",
        "opcoes": [
            {"ref": "fla", "descricao": "Flamengo", "sub": "Mandante", "odd": 2.1, "status": "Ativa", "vencedora": False},
            {"ref": "fla_emp", "descricao": "Empate", "sub": "Empate", "odd": 3.3, "status": "Ativa", "vencedora": False},
            {"ref": "pal", "descricao": "Palmeiras", "sub": "Visitante", "odd": 3.2, "status": "Ativa", "vencedora": False},
        ],
    },
    {
        "ref": "cor_sao",
        "mandante": "Corinthians",
        "visitante": "São Paulo",
        "competicao": "Brasileirão Série A",
        "data_hora": "Sáb · 20 jun · 18:30",
        "status": "Aberto",
        "resultado_descricao": "",
        "escudo_mandante": "escudo_corinthians.png",
        "escudo_visitante": "escudo_saopaulo.png",
        "opcoes": [
            {"ref": "cor", "descricao": "Corinthians", "sub": "Mandante", "odd": 2.65, "status": "Ativa", "vencedora": False},
            {"ref": "cor_emp", "descricao": "Empate", "sub": "Empate", "odd": 3.1, "status": "Ativa", "vencedora": False},
            {"ref": "sao", "descricao": "São Paulo", "sub": "Visitante", "odd": 2.7, "status": "Ativa", "vencedora": False},
        ],
    },
    {
        "ref": "gre_int",
        "mandante": "Grêmio",
        "visitante": "Internacional",
        "competicao": "Brasileirão Série A",
        "data_hora": "Dom · 21 jun · 16:00",
        "status": "Aberto",
        "resultado_descricao": "",
        "escudo_mandante": "escudo_gremio.png",
        "escudo_visitante": "escudo_internacional.png",
        "opcoes": [
            {"ref": "gre", "descricao": "Grêmio", "sub": "Mandante", "odd": 2.4, "status": "Ativa", "vencedora": False},
            {"ref": "gre_emp", "descricao": "Empate", "sub": "Empate", "odd": 3.2, "status": "Ativa", "vencedora": False},
            {"ref": "int", "descricao": "Internacional", "sub": "Visitante", "odd": 2.95, "status": "Ativa", "vencedora": False},
        ],
    },
    {
        "ref": "atl_cru",
        "mandante": "Atlético-MG",
        "visitante": "Cruzeiro",
        "competicao": "Brasileirão Série A",
        "data_hora": "Dom · 21 jun · 18:30",
        "status": "Aberto",
        "resultado_descricao": "",
        "escudo_mandante": "escudo_atleticomg.png",
        "escudo_visitante": "escudo_cruzeiro.png",
        "opcoes": [
            {"ref": "atl", "descricao": "Atlético-MG", "sub": "Mandante", "odd": 2.25, "status": "Ativa", "vencedora": False},
            {"ref": "atl_emp", "descricao": "Empate", "sub": "Empate", "odd": 3.25, "status": "Ativa", "vencedora": False},
            {"ref": "cru", "descricao": "Cruzeiro", "sub": "Visitante", "odd": 3.3, "status": "Ativa", "vencedora": False},
        ],
    },
    {
        "ref": "bot_flu",
        "mandante": "Botafogo",
        "visitante": "Fluminense",
        "competicao": "Brasileirão Série A",
        "data_hora": "Qua · 24 jun · 21:30",
        "status": "Fechado",
        "resultado_descricao": "",
        "escudo_mandante": "escudo_botafogo.png",
        "escudo_visitante": "escudo_fluminense.png",
        "opcoes": [
            {"ref": "bot", "descricao": "Botafogo", "sub": "Mandante", "odd": 2.05, "status": "Ativa", "vencedora": False},
            {"ref": "bot_emp", "descricao": "Empate", "sub": "Empate", "odd": 3.3, "status": "Ativa", "vencedora": False},
            {"ref": "flu", "descricao": "Fluminense", "sub": "Visitante", "odd": 3.6, "status": "Ativa", "vencedora": False},
        ],
    },
    {
        "ref": "bah_vit",
        "mandante": "Bahia",
        "visitante": "Vitória",
        "competicao": "Brasileirão Série A",
        "data_hora": "Dom · 14 jun · 16:00",
        "status": "Liquidado",
        "resultado_descricao": "Bahia 2 x 0 Vitória",
        "escudo_mandante": None,
        "escudo_visitante": None,
        "opcoes": [
            {"ref": "bah", "descricao": "Bahia", "sub": "Mandante", "odd": 1.95, "status": "Ativa", "vencedora": True},
            {"ref": "bah_emp", "descricao": "Empate", "sub": "Empate", "odd": 3.4, "status": "Ativa", "vencedora": False},
            {"ref": "vit", "descricao": "Vitória", "sub": "Visitante", "odd": 3.8, "status": "Ativa", "vencedora": False},
        ],
    },
]

# Apostas fictícias (as 4 do protótipo). usuario/opção referenciados por chave.
# criada_em / liquidada_em em "DD/MM/YYYY HH:MM".
APOSTAS_SEED = [
    {
        "usuario": "joao", "opcao": "fla", "valor": 100.0, "odd": 2.1, "retorno": 210.0,
        "status": "Aberta", "resultado": "Pendente",
        "criada_em": "15/06/2026 14:22", "liquidada_em": None,
    },
    {
        "usuario": "joao", "opcao": "bah", "valor": 50.0, "odd": 1.95, "retorno": 97.5,
        "status": "Liquidada", "resultado": "Ganhou",
        "criada_em": "13/06/2026 19:40", "liquidada_em": "14/06/2026 18:05",
    },
    {
        "usuario": "marina", "opcao": "sao", "valor": 75.0, "odd": 2.7, "retorno": 202.5,
        "status": "Aberta", "resultado": "Pendente",
        "criada_em": "16/06/2026 09:10", "liquidada_em": None,
    },
    {
        "usuario": "marina", "opcao": "vit", "valor": 40.0, "odd": 3.8, "retorno": 152.0,
        "status": "Liquidada", "resultado": "Perdeu",
        "criada_em": "13/06/2026 20:00", "liquidada_em": "14/06/2026 18:05",
    },
]

# Ledger coerente por apostador: cada entrada encadeia o saldo (saldo_apos) e o
# saldo final bate EXATO com o saldo do protótipo (João 947,50 · Marina 1230,00
# · Pedro 0,00). tipo ∈ {Credito Inicial, Aposta, Ganho}. aposta = chave da
# aposta (para preencher aposta_id) ou None.
LEDGER_SEED = {
    "joao": [
        {"tipo": "Credito Inicial", "valor": 1000.0, "saldo_apos": 1000.0, "aposta": None,
         "descricao": "Saldo fictício de boas-vindas", "criado_em": "02/06/2026 10:00"},
        {"tipo": "Aposta", "valor": -50.0, "saldo_apos": 950.0, "aposta": ("joao", "bah"),
         "descricao": "Aposta em Bahia x Vitória — Bahia", "criado_em": "13/06/2026 19:40"},
        {"tipo": "Ganho", "valor": 97.5, "saldo_apos": 1047.5, "aposta": ("joao", "bah"),
         "descricao": "Ganho em Bahia x Vitória — Bahia venceu", "criado_em": "14/06/2026 18:05"},
        {"tipo": "Aposta", "valor": -100.0, "saldo_apos": 947.5, "aposta": ("joao", "fla"),
         "descricao": "Aposta em Flamengo x Palmeiras — Flamengo", "criado_em": "15/06/2026 14:22"},
    ],
    "marina": [
        # Crédito inicial maior para manter o ledger coerente com o saldo final
        # do protótipo (1230,00) após as duas apostas (-40 perdida, -75 em aberto).
        {"tipo": "Credito Inicial", "valor": 1345.0, "saldo_apos": 1345.0, "aposta": None,
         "descricao": "Saldo fictício de boas-vindas", "criado_em": "05/06/2026 10:00"},
        {"tipo": "Aposta", "valor": -40.0, "saldo_apos": 1305.0, "aposta": ("marina", "vit"),
         "descricao": "Aposta em Bahia x Vitória — Vitória", "criado_em": "13/06/2026 20:00"},
        {"tipo": "Aposta", "valor": -75.0, "saldo_apos": 1230.0, "aposta": ("marina", "sao"),
         "descricao": "Aposta em Corinthians x São Paulo — São Paulo", "criado_em": "16/06/2026 09:10"},
    ],
    "pedro": [
        # Apostador bloqueado, sem saldo disponível.
        {"tipo": "Credito Inicial", "valor": 0.0, "saldo_apos": 0.0, "aposta": None,
         "descricao": "Conta bloqueada — sem saldo fictício", "criado_em": "06/06/2026 10:00"},
    ],
    "bianca": [
        {"tipo": "Credito Inicial", "valor": 1000.0, "saldo_apos": 1000.0, "aposta": None,
         "descricao": "Saldo fictício de boas-vindas", "criado_em": "08/06/2026 10:00"},
    ],
}


def _parse_dt(texto: Optional[str]) -> Optional[datetime]:
    """Converte 'DD/MM/YYYY HH:MM' (ou 'DD/MM/YYYY') em datetime naive (UTC)."""
    if not texto:
        return None
    for fmt in ("%d/%m/%Y %H:%M", "%d/%m/%Y"):
        try:
            return datetime.strptime(texto, fmt)
        except ValueError:
            continue
    logger.warning(f"Data de seed inválida: '{texto}'. Usando None.")
    return None


def _aplicar_avatar(usuario_id: int, nome_arquivo: str) -> bool:
    """Converte o avatar PNG da pasta seed para a foto JPG do usuário.

    O frontend resolve a foto via util/foto_util (static/img/usuarios/NNNNNN.jpg).
    Convertemos o PNG (RGBA) para JPG com fundo branco. Falhas são logadas e
    ignoradas (o usuário fica com a foto padrão já criada na inserção).
    """
    origem = PASTA_SEED_IMG / nome_arquivo
    if not origem.exists():
        logger.warning(f"Avatar de seed não encontrado: {origem.name}")
        return False
    try:
        destino = obter_path_absoluto_foto(usuario_id)
        imagem = Image.open(origem)
        if imagem.mode in ("RGBA", "LA", "P"):
            fundo = Image.new("RGB", imagem.size, (255, 255, 255))
            if imagem.mode == "P":
                imagem = imagem.convert("RGBA")
            fundo.paste(imagem, mask=imagem.split()[-1] if "A" in imagem.mode else None)
            imagem = fundo
        elif imagem.mode != "RGB":
            imagem = imagem.convert("RGB")
        imagem.save(destino, format="JPEG", quality=90, optimize=True)
        return True
    except (OSError, UnidentifiedImageError, ValueError) as e:
        logger.error(f"Erro ao aplicar avatar {nome_arquivo} ao usuário {usuario_id}: {e}")
        return False


def carregar_lancebet_seed():
    """Popula dados fictícios do LanceBet (idempotente).

    Insere apostadores, carteiras, eventos+opções, apostas e movimentações
    financeiras coerentes, refletindo o protótipo design/lancebet-react.

    Idempotência: só executa se NÃO houver eventos cadastrados (a tabela de
    eventos é o melhor sinal de que o seed de domínio ainda não rodou). O
    Admin Lance e os apostadores são tratados por e-mail (não duplica).
    """
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS total FROM evento_esportivo")
        if (cursor.fetchone()["total"] or 0) > 0:
            logger.info("Eventos já existem. Seed de domínio LanceBet não será executado.")
            return

        perfil_apostador = Perfil.APOSTADOR.value
        senha_hash = criar_hash_senha(SENHA_PADRAO_APOSTADOR)

        # ----- Apostadores (idempotente por e-mail) -----
        usuarios_por_chave: dict[str, int] = {}
        for ap in APOSTADORES_SEED:
            cursor.execute("SELECT id FROM usuario WHERE email = ?", (ap["email"],))
            existente = cursor.fetchone()
            if existente:
                usuario_id = existente["id"]
            else:
                cursor.execute(
                    """
                    INSERT INTO usuario (nome, email, senha, perfil, cpf, data_nascimento, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        ap["nome"], ap["email"], senha_hash, perfil_apostador,
                        ap["cpf"], ap["data_nascimento"], ap["status"],
                    ),
                )
                usuario_id = cursor.lastrowid
            usuarios_por_chave[ap["chave"]] = usuario_id
            _aplicar_avatar(usuario_id, ap["avatar"])

        # Admin: aplica avatar se o usuário do seed existir.
        cursor.execute("SELECT id FROM usuario WHERE email = ?", ("admin@lance.bet",))
        admin_row = cursor.fetchone()
        admin_id = admin_row["id"] if admin_row else None
        if admin_id:
            _aplicar_avatar(admin_id, "avatar_admin.png")
        # Autor dos eventos: admin se existir, senão o primeiro apostador.
        criado_por = admin_id or next(iter(usuarios_por_chave.values()))

        # ----- Carteiras -----
        carteira_id_por_chave: dict[str, int] = {}
        for chave, usuario_id in usuarios_por_chave.items():
            entradas = LEDGER_SEED.get(chave, [])
            saldo_final = entradas[-1]["saldo_apos"] if entradas else 1000.0
            cursor.execute(
                "SELECT id FROM carteira WHERE usuario_id = ?", (usuario_id,)
            )
            existente = cursor.fetchone()
            if existente:
                carteira_id = existente["id"]
                cursor.execute(
                    "UPDATE carteira SET saldo_ficticio = ?, atualizado_em = ? WHERE id = ?",
                    (round(saldo_final, 2), agora(), carteira_id),
                )
            else:
                cursor.execute(
                    "INSERT INTO carteira (usuario_id, saldo_ficticio, atualizado_em) VALUES (?, ?, ?)",
                    (usuario_id, round(saldo_final, 2), agora()),
                )
                carteira_id = cursor.lastrowid
            carteira_id_por_chave[chave] = carteira_id

        # ----- Eventos + opções -----
        opcao_id_por_ref: dict[str, int] = {}
        eventos_criados = 0
        opcoes_criadas = 0
        for ev in EVENTOS_SEED:
            titulo = f"{ev['mandante']} x {ev['visitante']}"
            cursor.execute(
                """
                INSERT INTO evento_esportivo
                    (mandante, visitante, titulo, esporte, competicao, data_hora,
                     status, resultado_descricao, criado_por, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ev["mandante"], ev["visitante"], titulo, "Futebol",
                    ev["competicao"], ev["data_hora"], ev["status"],
                    ev["resultado_descricao"], criado_por, agora(),
                ),
            )
            evento_id = cursor.lastrowid
            eventos_criados += 1
            for op in ev["opcoes"]:
                cursor.execute(
                    """
                    INSERT INTO opcao_aposta
                        (evento_id, descricao, sub, odd, status, vencedora)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        evento_id, op["descricao"], op["sub"], op["odd"],
                        op["status"], 1 if op["vencedora"] else 0,
                    ),
                )
                opcao_id_por_ref[op["ref"]] = cursor.lastrowid
                opcoes_criadas += 1

        # ----- Apostas -----
        aposta_id_por_chave: dict[tuple, int] = {}
        apostas_criadas = 0
        for ap in APOSTAS_SEED:
            usuario_id = usuarios_por_chave.get(ap["usuario"])
            opcao_id = opcao_id_por_ref.get(ap["opcao"])
            if usuario_id is None or opcao_id is None:
                logger.warning(
                    f"Aposta de seed ignorada (usuário/opção ausente): {ap}"
                )
                continue
            # Recupera evento/títulos para os snapshots desnormalizados.
            cursor.execute(
                """
                SELECT e.id AS evento_id, e.titulo AS titulo, o.descricao AS opcao_desc
                FROM opcao_aposta o
                INNER JOIN evento_esportivo e ON o.evento_id = e.id
                WHERE o.id = ?
                """,
                (opcao_id,),
            )
            ref = cursor.fetchone()
            cursor.execute(
                """
                INSERT INTO aposta
                    (usuario_id, opcao_aposta_id, evento_id, titulo, opcao_desc,
                     valor_apostado, odd_registrada, retorno_potencial,
                     status, resultado, criada_em, liquidada_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    usuario_id, opcao_id, ref["evento_id"], ref["titulo"],
                    ref["opcao_desc"], ap["valor"], ap["odd"], ap["retorno"],
                    ap["status"], ap["resultado"],
                    _parse_dt(ap["criada_em"]), _parse_dt(ap["liquidada_em"]),
                ),
            )
            aposta_id_por_chave[(ap["usuario"], ap["opcao"])] = cursor.lastrowid
            apostas_criadas += 1

        # ----- Movimentações financeiras (ledger coerente) -----
        movimentacoes_criadas = 0
        for chave, entradas in LEDGER_SEED.items():
            carteira_id = carteira_id_por_chave.get(chave)
            if carteira_id is None:
                continue
            for mov in entradas:
                aposta_id = (
                    aposta_id_por_chave.get(mov["aposta"]) if mov["aposta"] else None
                )
                cursor.execute(
                    """
                    INSERT INTO movimentacao_financeira
                        (carteira_id, aposta_id, tipo, valor, saldo_apos, descricao, criado_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        carteira_id, aposta_id, mov["tipo"], mov["valor"],
                        mov["saldo_apos"], mov["descricao"], _parse_dt(mov["criado_em"]),
                    ),
                )
                movimentacoes_criadas += 1

        logger.info(
            "Seed LanceBet: "
            f"{len(usuarios_por_chave)} apostadores, "
            f"{len(carteira_id_por_chave)} carteiras, "
            f"{eventos_criados} eventos, {opcoes_criadas} opções, "
            f"{apostas_criadas} apostas, {movimentacoes_criadas} movimentações."
        )


def inicializar_dados():
    """Inicializa todos os dados seed"""
    logger.info("=" * 50)
    logger.info("Iniciando carga de dados seed...")
    logger.info("=" * 50)

    try:
        carregar_usuarios_seed()
        carregar_lancebet_seed()
        logger.info("=" * 50)
        logger.info("Dados seed carregados!")
        logger.info("=" * 50)
    except sqlite3.Error as e:
        logger.error(f"Erro crítico ao inicializar dados seed: {e}", exc_info=True)
