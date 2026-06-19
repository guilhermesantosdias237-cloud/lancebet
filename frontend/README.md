# LanceBet — Frontend (SPA React)

SPA que consome a **API JSON** do backend FastAPI (ver [`../backend`](../backend)).
Parte da **arquitetura SPLIT** do LanceBet; a referência completa de arquitetura
e do contrato de API está no **[`../CLAUDE.md`](../CLAUDE.md)** (raiz do repositório).

> **Antes de editar páginas, leia [`CONVENTIONS.md`](./CONVENTIONS.md).** A infra (cliente
> HTTP, tipos, stores, componentes, layouts, router) **já existe** — em geral só se
> implementam páginas em `src/pages/**`. Não recrie helpers nem edite a infra sem motivo.

## Stack

- **React 19** + **React Router 7** + **TypeScript** + **Vite 6**
- **Zod** (validação de resposta) + **Zustand** (estado global)
- **Sem framework CSS**: estilos inline (paleta P&B do LanceBet, fontes Archivo /
  Alfa Slab One) + ícones SVG inline (`components/ui/Icon.tsx`). NÃO usa Bootstrap
  nem bootstrap-icons.
- **Vitest** + Testing Library (jsdom)

## Comandos

```bash
npm install
npm run dev            # Vite dev server na porta 5183 (proxy /api, /static, /health -> backend)
npm run build          # tsc -b && vite build  (saída em dist/)
npm run preview        # serve o build
npm run test           # vitest run
npx tsc -b --noEmit    # typecheck isolado
npm run lint           # eslint
```

> **Dev precisa do backend rodando.** O Vite proxia `/api`, `/static` e `/health` para
> `VITE_BACKEND_URL` (fallback `http://127.0.0.1:8413`), mantendo same-origin para que o
> cookie de sessão e o CSRF funcionem sem CORS. Ajuste `VITE_BACKEND_URL` se o backend
> subir em outra porta. Em produção o build de `dist/` é servido pelo próprio FastAPI.

## Estrutura (`src/`)

```
src/
├── main.tsx          # entrypoint; importa index.css e o router
├── router.tsx        # rotas; LanceBetLayout, RootGate, RouteError, guards (RotaAutenticada/RotaApostador/RotaAdmin)
├── lib/              # api.ts (cliente HTTP), schemas.ts (Zod), types.ts (tipos+enums), format.ts, imagens.ts
├── store/            # Zustand: authStore (sessão/usuário, isAdmin), uiStore (toast/confirmação/alerta)
├── hooks/            # useFetch (fetch com estado: data/carregando/erro/recarregar)
├── components/       # lancebet (Layout/Header/Footer/EventCard/guards/ui.tsx), ui (Icon/Toasts/Modais/Spinner/Pagination), routing (RootGate/RouteError)
├── pages/            # por domínio: auth, usuario, apostador, admin, public
├── assets/
└── test/             # setup do Vitest
```

Alias `@` → `src/` (configurado em `vite.config.ts` e `tsconfig.json`).

## Regras essenciais (resumo de CONVENTIONS.md)

- **Cliente HTTP**: `import { api, ApiError } from '@/lib/api'`. Caminhos relativos a `/api`
  (não incluir o prefixo). `credentials:'include'` e header `X-CSRF-Token` são automáticos.
  Erros lançam `ApiError` (`.status`, `.type`, `.message`, `.errors`, `.retryAfter`).
- **Tipos e enums** (`Usuario`, `Evento`, `Aposta`, `PaginaResponse<T>`, `Perfil`,
  `StatusEvento`, `StatusAposta`, ...): importe de `@/lib/types` — não redefina. Devem
  bater **exato** com os DTOs do backend.
- **Feedback**: `toast.sucesso/erro/aviso/info`, `pedirConfirmacao`, `mostrarAlerta`
  (de `@/store/uiStore`). **NUNCA** `alert()/confirm()/prompt()` nativos.
- **Leitura de dados**: `useFetch` + `<Spinner/>` enquanto carrega + tratar `erro`.
- **Ícones**: `<Icon name="..." />` de `components/ui/Icon.tsx`. Para um glifo novo,
  adicione o path (16×16) no mapa `PATHS` — não reintroduza bootstrap-icons.

## Documentação Adicional

- **[`CONVENTIONS.md`](./CONVENTIONS.md)** — guia detalhado para implementar páginas (LEIA antes de editar).
- **[`../CLAUDE.md`](../CLAUDE.md)** — arquitetura, contrato de API e convenções do repositório.
