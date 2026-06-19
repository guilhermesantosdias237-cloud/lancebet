# Convenções do Frontend (LEIA ANTES DE EDITAR QUALQUER PÁGINA)

Stack: **React 19 + React Router 7 + Zod + Zustand + TypeScript + Vite**.
UI **sem framework CSS**: estilos **inline** com a identidade do LanceBet
(paleta preto/branco/cinza, fontes Archivo / Alfa Slab One) e ícones **SVG inline**
(`components/ui/Icon.tsx`). **NÃO** há Bootstrap nem bootstrap-icons — foram removidos;
não reintroduza classes `btn`/`card`/`row`/`col` nem `<i className="bi …">`.

A infraestrutura (api, tipos, stores, hooks, componentes, layout, router) **já existe**.
Você implementa páginas em `src/pages/**`. **NÃO** edite o router, o layout nem a
infra, salvo instrução explícita. Use SEMPRE o que já existe — não recrie helpers.

Referência visual: o protótipo `design/lancebet-react/` (estética inline P&B). Replique-o,
não os antigos templates Jinja do WebStandard.

## Cliente HTTP — `src/lib/api.ts`

Toda chamada passa por um módulo tipado: `authApi`, `eventosApi`, `apostasApi`,
`carteiraApi`, `adminApi`. Por baixo, o cliente `api`:

```ts
import { api, ApiError } from '@/lib/api'
const evento = await api.get<Evento>(`/eventos/${id}`)
await api.post<ApostaComSaldo>('/apostas', { opcao_id, valor })
await api.patch(`/admin/eventos/${id}/status`, { status })
```

- Caminhos são **relativos a `/api`** (não inclua o prefixo `/api`).
- `credentials: include` e header **`X-CSRF-Token`** são automáticos. Não se preocupe com CSRF.
- Query string: `api.get('/eventos', { params: { status, pagina } })`.
- Erros lançam `ApiError` com `.status`, `.type`, `.message` (detail), `.errors` (por campo),
  `.retryAfter`. Para erro de validação (422): `err.errors?.campo?.[0]`.

## Tipos — `src/lib/types.ts`

Shapes do domínio LanceBet já estão lá: `Usuario`, `Evento`, `EventoAdmin`, `OpcaoAposta`,
`Aposta`, `ApostaComSaldo`, `Carteira`, `MovimentacaoFinanceira`, `AdminDashboard`,
`LiquidacaoResultado`, `UsuarioAdmin`, `PaginaResponse<T>`. Enums como objetos const —
**importe daqui, não redefina**:
`Perfil` (Administrador/Apostador), `StatusEvento` (Aberto/Fechado/Liquidado),
`StatusOpcao` (Ativa/Suspensa), `StatusAposta` (Aberta/Liquidada),
`ResultadoAposta` (Pendente/Ganhou/Perdeu), `TipoMovimentacao`,
`StatusUsuario` (Ativo/Bloqueado).

## Estado global — `src/store/`

```ts
import { useAuthStore } from '@/store/authStore'
const usuario = useAuthStore((s) => s.usuario)        // Usuario | null
const isAdmin = useAuthStore((s) => s.isAdmin())
const isApostador = useAuthStore((s) => s.isApostador())
const setUsuario = useAuthStore((s) => s.setUsuario)  // após editar perfil/foto

import { toast, useUIStore } from '@/store/uiStore'
toast.sucesso('Salvo!'); toast.erro('Falhou'); toast.info('...'); toast.aviso('...')
const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)
const mostrarAlerta = useUIStore((s) => s.mostrarAlerta)
```

## Feedback ao usuário (REGRAS)

- **NUNCA** use `alert()`, `confirm()`, `prompt()` nativos.
- Notificações rápidas → `toast.sucesso/erro/aviso/info(msg)`.
- Confirmação de ação destrutiva → `pedirConfirmacao({ mensagem, tipo:'danger', onConfirmar })`.
- Aviso modal → `mostrarAlerta({ mensagem, tipo })`.
- `Toasts`, `ConfirmModal` e `AlertModal` já estão montados no `LanceBetLayout` — só dispare via store.

## Componentes prontos — `src/components/`

- `ui/Icon.tsx` (default): `<Icon name="trophy" size={16} />`. Herda cor via `currentColor`.
  Glifo novo → adicione o path (viewBox 16×16) no mapa `PATHS`. **Não** use bootstrap-icons.
- `ui/Spinner.tsx` (default): `<Spinner texto?/>`. Exporta também `spinnerRing` (estilo do anel).
- `ui/Pagination.tsx` (default): `<Pagination pagina totalPaginas onPagina={(p)=>...} />`.
- `lancebet/ui.tsx`: primitivos visuais inline — `Button` (variants primary/light/outline/ghostDark),
  `Badge`, `HoverCard`, e helpers de estilo (`statusEventoStyle`, `statusEventoStyleDark`,
  `apostaBadgeStyle`, `apostaBadgeLabel`, `optionCardStyle`, `tabStyle`, `filterStyle`, `pickStyle`).
- `lancebet/EventCard.tsx`: card de evento da listagem/home.

## Leitura de dados — `src/hooks/useFetch.ts`

```ts
import { useFetch } from '@/hooks/useFetch'
const { data, carregando, erro, recarregar } = useFetch(
  () => eventosApi.listar({ status: filtro || undefined, pagina, por_pagina: 12 }),
  [filtro, pagina],
)
```
Renderize `<Spinner/>` quando `carregando`, trate `erro`, depois use `data`.

## Validação de formulários — Zod

Defina o schema com Zod, valide no submit, mapeie erros para os campos. Padrão:

```ts
import { z } from 'zod'
const schema = z.object({ email: z.string().email('E-mail inválido'), senha: z.string().min(6) })
type Form = z.infer<typeof schema>
// no submit:
const parsed = schema.safeParse(form)
if (!parsed.success) { setErros(parsed.error.flatten().fieldErrors); return }
try { await api.post('/login', parsed.data) }
catch (e) { if (e instanceof ApiError && e.errors) setErros(e.errors); else toast.erro((e as Error).message) }
```
Schemas reutilizáveis ficam em `src/lib/schemas.ts`.

## Navegação

`import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'`.
Use `<Link to>` em vez de `<a href>`. Rotas já registradas no router (não altere).
Guards: `RotaAutenticada` (logado), `RotaApostador`, `RotaAdmin`.

## Estilo / identidade visual

- **Estilos inline** (objeto `CSSProperties`), não classes utilitárias. Paleta:
  `#000` / `#fff` / `#f4f4f4` (fundo) / `#7f7f7f` (cinza) / `#e4e4e4` (borda).
- Títulos em `'Alfa Slab One', serif`; corpo em `'Archivo', sans-serif`.
- Hover/seleção → estado React (`useState`) + `onMouseEnter/Leave`, como em `lancebet/ui.tsx`.
- Reaproveite os helpers de estilo de `lancebet/ui.tsx` antes de criar estilos novos.
- Ícones → `<Icon name="…" />`. Formatação → `src/lib/format.ts`
  (`formatarData/DataHora/Hora/Moeda/Bytes` + os atalhos do LanceBet: `fmt` (moeda com sinal),
  `ofmt` (odd), `proto` (protocolo `LB-000000`)).
- Banners e escudos → `src/lib/imagens.ts` (`HERO_HOME/HERO_EVENTOS/HERO_PAINEL` e
  `escudoDeTime(nome)`), servidos pelo backend em `/static/img/seed/`.

## Regras de saída

- Cada página é **default export**, nome do componente = nome do arquivo.
- TypeScript **strict** + `noUnusedLocals/Parameters`: não deixe imports/vars sem uso.
- Não use `any` implícito; tipe tudo. O build roda `tsc -b` — precisa passar.
