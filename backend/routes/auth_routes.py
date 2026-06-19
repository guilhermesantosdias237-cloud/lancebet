# =============================================================================
# Rotas de Autenticação (API JSON)
# =============================================================================

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.auth_dto import (
    LoginLanceBetDTO,
    CadastroApostadorDTO,
    EsqueciSenhaDTO,
    RedefinirSenhaDTO,
)

# Schemas (saída)
from dtos.responses.comum import MensagemResponse, TokenCsrfResponse
from dtos.responses.usuario_response import UsuarioComSaldoResponse

# Models
from model.usuario_model import Usuario
from model.usuario_logado_model import UsuarioLogado
from model.carteira_model import TipoMovimentacao

# Repositories
from repo import usuario_repo, carteira_repo

# Perfis
from util.perfis import Perfil

# Conexão (transação atômica do cadastro: carteira + crédito inicial)
from util.db_util import obter_conexao

# Utilities
from util.api_helpers import checar_rate_limit
from util.auth_decorator import criar_sessao, destruir_sessao, requer_autenticacao
from util.csrf_protection import obter_token_csrf
from util.datetime_util import agora
from util.email_service import servico_email
from util.logger_config import logger
from util.rate_limiter import DynamicRateLimiter
from util.security import (
    criar_hash_senha,
    verificar_senha,
    gerar_token_redefinicao,
    obter_data_expiracao_token,
)
from util.validation_helpers import verificar_email_disponivel

TOKEN_EXPIRACAO_HORAS = 1

# Crédito fictício de boas-vindas concedido a cada novo apostador.
SALDO_BOAS_VINDAS = 1000.0

router = APIRouter()


# =============================================================================
# Rate Limiters
# =============================================================================

login_limiter = DynamicRateLimiter(
    chave_max="rate_limit_login_max",
    chave_minutos="rate_limit_login_minutos",
    padrao_max=5,
    padrao_minutos=5,
    nome="login",
)
cadastro_limiter = DynamicRateLimiter(
    chave_max="rate_limit_cadastro_max",
    chave_minutos="rate_limit_cadastro_minutos",
    padrao_max=3,
    padrao_minutos=10,
    nome="cadastro",
)
esqueci_senha_limiter = DynamicRateLimiter(
    chave_max="rate_limit_esqueci_senha_max",
    chave_minutos="rate_limit_esqueci_senha_minutos",
    padrao_max=1,
    padrao_minutos=1,
    nome="esqueci_senha",
)


# =============================================================================
# CSRF / Sessão
# =============================================================================

@router.get("/csrf-token", response_model=TokenCsrfResponse)
async def get_csrf_token(request: Request):
    """Retorna o token CSRF da sessão (criando a sessão se necessário)."""
    return TokenCsrfResponse(token=obter_token_csrf(request))


@router.get("/me", response_model=UsuarioComSaldoResponse)
@requer_autenticacao()
async def get_me(request: Request, usuario_logado: Optional[UsuarioLogado] = None):
    """Retorna o usuário autenticado atual com o saldo da carteira (401 sem sessão)."""
    assert usuario_logado is not None
    usuario = usuario_repo.obter_por_id(usuario_logado.id)
    if not usuario:
        destruir_sessao(request)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")
    saldo = carteira_repo.obter_saldo(usuario.id)
    return UsuarioComSaldoResponse.de_usuario_e_saldo(usuario, saldo)


# =============================================================================
# Login / Logout
# =============================================================================

@router.post("/login", response_model=UsuarioComSaldoResponse)
async def post_login(request: Request, dto: LoginLanceBetDTO):
    """Autentica via e-mail OU CPF + senha e cria a sessão.

    O ``identificador`` pode ser um e-mail (case-insensitive) ou um CPF (com ou
    sem formatação). Contas com status 'Bloqueado' são impedidas de logar.
    """
    checar_rate_limit(login_limiter, request)

    usuario = usuario_repo.obter_por_email_ou_cpf(dto.identificador)
    if not usuario or not verificar_senha(dto.senha, usuario.senha):
        logger.warning(f"Login falhou para: {dto.identificador}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail/CPF ou senha inválidos.",
        )

    if (usuario.status or "Ativo") == "Bloqueado":
        logger.warning(f"Login bloqueado para usuário inativo: {usuario.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta bloqueada. Entre em contato com o suporte.",
        )

    usuario_logado = UsuarioLogado.from_usuario(usuario)
    criar_sessao(request, usuario_logado)
    saldo = carteira_repo.obter_saldo(usuario.id)
    logger.info(f"Usuário {usuario.email} autenticado")
    return UsuarioComSaldoResponse.de_usuario_e_saldo(usuario, saldo)


@router.post("/logout", response_model=MensagemResponse)
async def post_logout(request: Request):
    """Encerra a sessão do usuário."""
    email = request.session.get("usuario_logado", {}).get("email", "Usuário")
    destruir_sessao(request)
    logger.info(f"Usuário {email} fez logout")
    return MensagemResponse(message="Logout realizado com sucesso.")


# =============================================================================
# Cadastro
# =============================================================================

@router.post(
    "/cadastrar",
    response_model=UsuarioComSaldoResponse,
    status_code=status.HTTP_201_CREATED,
)
async def post_cadastrar(request: Request, dto: CadastroApostadorDTO):
    """Cria uma conta de Apostador com carteira e crédito fictício de boas-vindas.

    O perfil é fixado em 'Apostador' (não vem do cliente). Após inserir o
    usuário, a carteira (saldo 1000) e a movimentação de crédito inicial são
    criadas numa única transação atômica.
    """
    checar_rate_limit(cadastro_limiter, request)

    # Sem guarda anti-escalada de privilégio aqui (diverge do starter): neste
    # fork o auto-cadastro usa CadastroApostadorDTO, que NÃO tem campo `perfil`.
    # O perfil é fixado em 'Apostador' no servidor (ver abaixo), então o cliente
    # não consegue escolher perfil nenhum — o vetor de escalada que o starter
    # bloqueia (cliente envia perfil=Administrador) simplesmente não existe.

    disponivel, mensagem_erro = verificar_email_disponivel(dto.email)
    if not disponivel:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": mensagem_erro,
                "type": "conflict",
                "errors": {"email": [mensagem_erro]},
            },
        )

    # CPF é opcional, mas único quando informado.
    if dto.cpf and usuario_repo.obter_por_cpf(dto.cpf):
        msg_cpf = "Este CPF já está cadastrado."
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "detail": msg_cpf,
                "type": "conflict",
                "errors": {"cpf": [msg_cpf]},
            },
        )

    usuario = Usuario(
        id=0,
        nome=dto.nome,
        email=dto.email,
        senha=criar_hash_senha(dto.senha),
        perfil=Perfil.APOSTADOR.value,
        cpf=dto.cpf,
        data_nascimento=dto.data_nascimento,
        status="Ativo",
    )
    usuario_id = usuario_repo.inserir(usuario)
    if not usuario_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao realizar cadastro. Tente novamente.",
        )

    # Carteira + crédito inicial em uma única transação (rollback em falha).
    try:
        with obter_conexao() as conn:
            carteira_id = carteira_repo.criar_carteira(
                usuario_id, saldo_inicial=SALDO_BOAS_VINDAS, conn=conn
            )
            carteira_repo.registrar_movimentacao(
                carteira_id=carteira_id,
                tipo=TipoMovimentacao.CREDITO_INICIAL,
                valor=SALDO_BOAS_VINDAS,
                saldo_apos=SALDO_BOAS_VINDAS,
                descricao="Saldo fictício de boas-vindas",
                aposta_id=None,
                conn=conn,
            )
    except Exception as e:
        logger.error(
            f"Falha ao criar carteira do usuário {usuario_id}: {e}", exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao inicializar a carteira. Tente novamente.",
        )

    logger.info(f"Novo apostador cadastrado: {usuario.email}")
    servico_email.enviar_boas_vindas(usuario.email, usuario.nome)

    criado = usuario_repo.obter_por_id(usuario_id)

    # Autentica o recém-cadastrado: o cadastro já deixa o usuário logado, de
    # modo que o SPA pode redirecionar direto ao painel com sessão válida (sem
    # 401 nas chamadas autenticadas seguintes).
    criar_sessao(request, UsuarioLogado.from_usuario(criado))

    return UsuarioComSaldoResponse.de_usuario_e_saldo(criado, SALDO_BOAS_VINDAS)


# =============================================================================
# Recuperação de senha
# =============================================================================

@router.post("/esqueci-senha", response_model=MensagemResponse)
async def post_esqueci_senha(request: Request, dto: EsqueciSenhaDTO):
    """Solicita recuperação de senha; e-mail com link para o SPA."""
    checar_rate_limit(esqueci_senha_limiter, request)

    usuario = usuario_repo.obter_por_email(dto.email)
    if usuario:
        token = gerar_token_redefinicao()
        data_expiracao = obter_data_expiracao_token(horas=TOKEN_EXPIRACAO_HORAS)
        usuario_repo.atualizar_token(usuario.email, token, data_expiracao)
        enviado = servico_email.enviar_recuperacao_senha(
            usuario.email, usuario.nome, token
        )
        if enviado:
            logger.info(f"E-mail de recuperação enviado para: {usuario.email}")
        else:
            logger.error(f"Falha ao enviar recuperação para: {usuario.email}")

    # Mesma resposta sempre (evita enumeração de e-mails)
    return MensagemResponse(
        message=(
            "Se o e-mail estiver cadastrado, você receberá instruções "
            "para recuperação de senha."
        )
    )


@router.post("/redefinir-senha", response_model=MensagemResponse)
async def post_redefinir_senha(request: Request, dto: RedefinirSenhaDTO):
    """Redefine a senha a partir do token recebido por e-mail."""
    usuario = usuario_repo.obter_por_token(dto.token)
    if not usuario or not usuario.data_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado.",
        )

    # data_token pode vir como datetime (conversor do SQLite) ou string
    data_token = usuario.data_token
    if isinstance(data_token, str):
        try:
            data_token = datetime.fromisoformat(data_token)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido."
            )
    if data_token.tzinfo is None:
        data_token = data_token.replace(tzinfo=agora().tzinfo)
    if agora() > data_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token expirado. Solicite uma nova recuperação.",
        )

    senha_hash = criar_hash_senha(dto.senha)
    usuario_repo.atualizar_senha(usuario.id, senha_hash)
    usuario_repo.limpar_token(usuario.id)
    logger.info(f"Senha redefinida para: {usuario.email}")

    return MensagemResponse(message="Senha redefinida com sucesso.")
