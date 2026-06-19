# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Boilerplate educacional (projetos integradores) com **arquitetura SPLIT**: API REST JSON em FastAPI + SPA React, repos separados na mesma raiz.

- `backend/` — FastAPI (Python 3.11+, SQLite **sem ORM**, SQL puro com prepared statements). Serve **apenas JSON** sob `/api` + `static/`. Em produção também serve o `index.html` do SPA buildado.
- `frontend/` — SPA React 19 + React Router 7 + TypeScript + Zod + Zustand + Vite. UI **sem framework CSS**: estilos inline (paleta P&B do LanceBet, fontes Archivo / Alfa Slab One) + ícones SVG inline (`components/ui/Icon.tsx`). NÃO usa Bootstrap nem bootstrap-icons (removidos).
- Deploy (produção deste fork): **https://lancebet.ifes.site** (nginx no VPS Cachoeiro faz proxy `lancebet.ifes.site` → `127.0.0.1:8413` → container porta interna 8000). Em dev, Vite faz proxy de `/api`, `/static`, `/health` → backend (same-origin, sem CORS).
- `.lesson-bridge/` é **workspace externo** (plugins de aula) — não faz parte deste app; **ignore-o** ao analisar/editar o código.

> **Esquema de portas (2 camadas)**: **8000** = porta interna do container (Uvicorn no Docker; imutável). **8413** = porta usada em dev local (`backend/.env` `PORT=8413`, `BASE_URL=http://localhost:8413`, alvo do proxy Vite) **e** a porta publicada no VPS (`deploy/docker-compose.yml` mapeia `8413:8000`; nginx serve em `lancebet.ifes.site`). Atenção: `backend/util/config.py` usa default `8413` e `scripts/configurar_projeto.py` traz `8400` como exemplo de template do starter kit (não é a porta efetiva deste fork — o `.env` sobrescreve para 8413).

## Comandos

### Backend (rodar a partir de `backend/`)
O `.python-version` aponta para 3.14 (não instalado) — **sempre** usar o interpretador do venv:

```bash
backend/.venv/bin/python main.py                    # sobe API (porta via .env PORT; default 8413)
backend/.venv/bin/python -m pytest                  # todos os testes
backend/.venv/bin/python -m pytest tests/unit       # só unitários
backend/.venv/bin/python -m pytest tests/integration/test_x.py::TestClasse::test_metodo  # um teste
backend/.venv/bin/python -m pytest -m "not slow"    # markers: slow, integration, unit, auth, crud
```
Docs interativas em `/docs`. `pytest.ini` usa `asyncio_mode=auto`.

### Frontend (rodar a partir de `frontend/`)
```bash
npm run dev          # Vite dev server na porta 5183 (proxy /api -> VITE_BACKEND_URL, default http://127.0.0.1:8413)
npm run build        # tsc -b && vite build  (saída em dist/, servida pelo backend em prod)
npm run test         # vitest run
npx tsc -b --noEmit  # typecheck isolado
npm run lint         # eslint
```

## Contrato de API — eixo central da conformidade backend↔frontend

Mudou algo de um lado, espelhe no outro. Os dois lados têm que bater **exato**.

- **Prefixo único `/api`**: backend monta todos os routers sob `API_PREFIX="/api"` (`backend/main.py`); frontend `src/lib/api.ts` usa `BASE='/api'`. Caminhos no front são **relativos a `/api`** (não incluir o prefixo).
- **Cliente HTTP central**: `frontend/src/lib/api.ts` — `credentials:'include'`, header `X-CSRF-Token` automático, classe `ApiError` (`.status`, `.type`, `.message`, `.errors`, `.retryAfter`). **Toda** chamada do SPA passa por aqui. Módulos: `authApi`, `eventosApi`, `apostasApi`, `carteiraApi`, `adminApi`.
- **Contrato de erro**: `{detail, type, errors}` via handlers globais em `backend/util/exception_handlers.py`. Validação 422 → `util/validation_util.py:processar_erros_validacao_lista` chaveia erros por `loc[-1]` (último segmento; body aninhado vira chave simples). Traceback de dev fica fora do contrato.
- **Paginação**: envelope `PaginaResponse[T]` (`backend/dtos/responses/comum.py`: `items/pagina/por_pagina/total/total_paginas`) ↔ `PaginaResponse<T>` em `frontend/src/lib/types.ts`. Params `pagina`/`por_pagina`.
- **CSRF**: mutações enviam `X-CSRF-Token`; `GET /api/csrf-token` → `{token}`.
- **Tipos espelhados**: Response DTOs em `backend/dtos/responses/*.py` ↔ tipos em `frontend/src/lib/types.ts` ↔ validação Zod em `frontend/src/lib/schemas.ts`.
- **Enums de domínio LanceBet** (valores exatos no backend, em `model/*` e `util/perfis.py`): `Perfil` (Administrador/Apostador), `StatusEvento` (Aberto/Fechado/Liquidado), `StatusOpcao` (Ativa/Suspensa), `StatusAposta` (Aberta/Liquidada/Cancelada), `ResultadoAposta` (Pendente/Ganhou/Perdeu), `TipoMovimentacao` (Credito Inicial/Aposta/Ganho/Estorno). Fonte única no front: `frontend/src/lib/types.ts` (objetos const) — que também define `StatusUsuario` (Ativo/Bloqueado). Os objetos const do front cobrem só os estados usados na UI do MVP (`StatusAposta` sem Cancelada, `TipoMovimentacao` sem Estorno); ao expor esses estados na UI, espelhe o membro extra no front.

## Arquitetura backend (`backend/`)

Camadas: **Routes → DTOs → Repos → SQL → DB**. `main.py` registra repos (criação de tabelas) e routers.

- **Auth**: decorator `@requer_autenticacao()` (`util/auth_decorator.py`) + dataclass `UsuarioLogado` (NUNCA dict). Sessão por cookie (`SessionMiddleware`, `SameSite=lax`).
- **Ordem dos middlewares importa** (último `add_middleware` é o mais externo): SegurançaHeaders (externo) → Session → CSRF. CSRF precisa de `request.session` já populado.
- **Perfis**: enum `Perfil` de `util/perfis.py` (fonte única; NUNCA strings literais). Enums de domínio herdam de `EnumEntidade` (`util/enum_base.py`).
- **DB datetime**: usar `agora()` de `util/datetime_util.py` ao salvar (NUNCA `.strftime()`).
- **Validação de form**: validators em `dtos/validators.py`; levantam `ValueError` → 422.
- **Rate limit**: cada rota instancia um `DynamicRateLimiter` (`util/rate_limiter.py`) com chaves de config (ex.: `rate_limit_login_max`/`_minutos`, lidas do banco via `config_cache`) e chama `util/api_helpers.py:checar_rate_limit(limiter, request)` no início do endpoint (já emite header `Retry-After` no 429). Usado em `auth_routes`, `usuario_routes`, `admin_usuarios_routes`, `aposta_routes` e `carteira_routes`; `evento_routes` (leitura pública) não aplica rate limit.
- **Seed admin**: `backend/data/admin_seed.json` (perfil Administrador) — útil p/ testar páginas protegidas/admin.

## Arquitetura frontend (`frontend/src/`)

**Leia `frontend/CONVENTIONS.md` antes de editar páginas.** A infra (api, tipos, stores, componentes, layouts, router) já existe — em geral só se implementam páginas em `src/pages/**`; não recriar helpers.

- `lib/` — `api.ts` (cliente), `schemas.ts` (Zod), `types.ts` (tipos+enums const), `format.ts` (`formatarData/DataHora/Hora/Moeda/Bytes` + helpers do LanceBet `fmt` moeda c/ sinal, `ofmt` odd, `proto` protocolo `LB-000000`), `imagens.ts` (caminhos de banners `HERO_*` e `escudoDeTime()` para escudos em `/static/img/seed/`).
- `store/` — Zustand: `authStore` (sessão/usuário, `isAdmin()`), `uiStore` (toast/confirmação/alerta). Feedback **sempre** via `toast.sucesso/erro/aviso/info` ou `pedirConfirmacao`/`mostrarAlerta` — **NUNCA** `alert()/confirm()/prompt()` nativos.
- `hooks/useFetch.ts` — fetch com `{data, carregando, erro, recarregar}`.
- `router.tsx` — `RootGate` (carrega sessão via `/api/me`; 401 anônimo é esperado) + `RouteError` (errorElement) na raiz; layout único `LanceBetLayout` (header + toasts/modais do uiStore). Guards: `RotaAutenticada` (logado), `RotaApostador`, `RotaAdmin`.
- `components/lancebet/` — `LanceBetLayout`, `Header`, `Footer`, `EventCard`, guards de rota (`Rota*`), primitivos visuais inline (`ui.tsx`: Button/Badge/HoverCard etc.).
- `components/ui/` — `Icon` (SVG inline, substitui bootstrap-icons), `Toasts`, `ConfirmModal`, `AlertModal` (+ `modalStyles.ts`), `Spinner`, `Pagination`. `components/routing/` — `RootGate`, `RouteError`.
- Alias `@` → `src/`.
- **Ícones**: usar `<Icon name="..." />` de `components/ui/Icon.tsx`. Para um glifo novo, adicionar o path (16×16) no mapa `PATHS` — NÃO reintroduzir bootstrap-icons nem `<i className="bi …">`.
- **Textareas controladas** NÃO populam via MCP `fill`/`fill_form`; usar setter nativo + dispatch de evento `input`.

## Módulos de domínio (rota backend ↔ página frontend)

O LanceBet é uma plataforma de **apostas simuladas** (saldo fictício). Domínio real do SPA:

- **público**: `/` (home) e `/regras` (regras da plataforma), abertas a anônimos.
- **auth**: login (e-mail ou CPF)/logout/cadastrar/recuperar-senha/me/csrf-token. Páginas: `/entrar`, `/cadastro`, `/recuperar-senha`.
- **perfil** (`/perfil`): ver/editar dados + foto (base64, máx 10MB, valida tipo+tamanho no cliente) + trocar senha. Aberto a qualquer perfil logado.
- **eventos** (apostador): `/eventos` (lista com filtro `status`), `/eventos/:id` (detalhe + montar boletim). `GET /api/eventos` exclui LIQUIDADO por padrão.
- **apostas + carteira** (apostador): `/painel` (dashboard), confirmar aposta → `/aposta-confirmada`, `/minhas-apostas`, `/carteira` (extrato de movimentações). Saldo de boas-vindas R$ 1.000 fictício; sem depósito/saque.
- **admin** (perfil Administrador): `/admin` (dashboard), `/admin/eventos` (CRUD + abrir/fechar), `/admin/odds[/:id]` (ajustar odds/suspender opções), `/admin/resultados` (liquidar apostas), `/admin/usuarios`.

**Seeds**: `backend/data/admin_seed.json` (admin: `lancebet@ifes.site` / `Admin!123`). Apostadores fictícios em `backend/util/seed_data.py` (ex.: `joao@email.com`, senha `123456`).

> **Limpeza do starter kit**: os módulos boilerplate herdados (chamados, pagamentos, chat, notificacoes, admin config/backups/auditoria) foram **removidos** de backend e frontend — routers, repos, dtos, models, tabelas e testes. Permanece apenas a **infra de configuração** (`repo/configuracao_repo.py` + `util/config_cache.py` + `util/config.py` + `util/migrar_config.py`), que alimenta os settings de runtime lidos por todo o backend; não é "feature", é base.

## Convenções de commit (do usuário)

- `git add` **SELETIVO**: só os arquivos que esta sessão alterou. NUNCA `git add -A/./-u`, `git commit -a/-am`. Rodar `git status --short` e cruzar com a lista de arquivos editados antes de commitar (há múltiplos agentes paralelos no mesmo repo).
- Pedir confirmação antes de push. PR só com permissão explícita por PR. Não se identificar como Claude nos commits.
