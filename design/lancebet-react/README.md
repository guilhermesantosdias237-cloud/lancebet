# LANCE.BET — MVP (React + Vite)

Plataforma **simulada** de apostas esportivas (Brasileirão Série A). Saldo fictício, sem dinheiro real. Projeto acadêmico.

Convertido do protótipo HTML para um app React componentizado, navegável (React Router) e com fonte de dados fictícia em JSON.

## Stack

- **React 19** + **Vite 6**
- **React Router 8** (navegação por rotas — pacote `react-router`, ESM-only, requer Node 22+)
- Estado global via **Context API** (`src/context/AppContext.jsx`)
- Dados-semente em **JSON** (`src/data/seed.json`)
- Estilos **inline** (paleta preto / branco / cinza), fontes Alfa Slab One + Archivo via Google Fonts

## Como rodar

```bash
cd lancebet-react
npm install
npm run dev      # http://localhost:5173
```

Build de produção: `npm run build` · preview do build: `npm run preview`.

## Contas de demonstração

| Perfil        | Login              | Senha    |
|---------------|--------------------|----------|
| Apostador     | `joao@email.com`   | `123456` |
| Administrador | `admin@lance.bet`  | `admin`  |

A tela de login também tem botões de acesso rápido para cada perfil.

## Estrutura

```
src/
├── main.jsx                 # bootstrap React + Router + Provider
├── App.jsx                  # definição das rotas + layout + guards
├── index.css                # reset, fontes, keyframes
├── data/
│   └── seed.json            # usuários, eventos, apostas, movimentações
├── lib/
│   └── format.js            # formatação (R$, odds, datas) + estilos por status
├── context/
│   └── AppContext.jsx       # estado global + ações (login, aposta, liquidação…)
├── components/
│   ├── Header.jsx           # cabeçalho (varia por perfil)
│   ├── Footer.jsx           # rodapé + faixa 18+
│   ├── EventCard.jsx        # card de evento reutilizável
│   ├── Toast.jsx            # notificações
│   ├── ProtectedRoute.jsx   # guarda de rota por perfil
│   ├── ScrollToTop.jsx      # rola ao topo na troca de rota
│   └── ui.jsx               # Button, Badge, HoverCard
└── pages/
    ├── Home.jsx             # landing pública
    ├── Auth.jsx             # login + cadastro (validação de maioridade)
    ├── Rules.jsx            # regras & LGPD
    ├── Dashboard.jsx        # painel do apostador
    ├── Events.jsx           # lista de eventos
    ├── EventDetail.jsx      # detalhe + boletim de aposta
    ├── Confirm.jsx          # confirmação da aposta
    ├── MyBets.jsx           # minhas apostas (com filtros)
    ├── Wallet.jsx           # carteira + extrato
    └── admin/
        ├── AdminDashboard.jsx
        ├── AdminEvents.jsx  # cadastro / abrir / fechar
        ├── AdminOdds.jsx    # editar odds, suspender, adicionar mercados
        ├── AdminResult.jsx  # registrar resultado + liquidar
        └── AdminUsers.jsx   # usuários + histórico geral
```

## Rotas

| Rota                    | Acesso        | Tela                         |
|-------------------------|---------------|------------------------------|
| `/`                     | Público       | Home                         |
| `/entrar`, `/cadastro`  | Público       | Login / Cadastro             |
| `/regras`               | Público       | Regras & LGPD                |
| `/painel`               | Apostador     | Dashboard                    |
| `/eventos`              | Apostador     | Lista de eventos             |
| `/eventos/:id`          | Apostador     | Detalhe + aposta             |
| `/aposta-confirmada`    | Apostador     | Confirmação                  |
| `/minhas-apostas`       | Apostador     | Minhas apostas               |
| `/carteira`             | Apostador     | Carteira / extrato           |
| `/admin`                | Administrador | Painel admin                 |
| `/admin/eventos`        | Administrador | Gerenciar eventos            |
| `/admin/odds/:id?`      | Administrador | Mercados & odds              |
| `/admin/resultados`     | Administrador | Registrar resultado          |
| `/admin/usuarios`       | Administrador | Usuários & apostas           |

## Observações

- **Persistência:** o estado vive em memória (Context). Recarregar a página restaura o `seed.json`. Para persistir, plugue uma API ou `localStorage` no `AppContext`.
- **Regra de negócio principal:** ao apostar, o valor é debitado do saldo; ao liquidar um evento (admin marca a opção vencedora), as apostas ganhadoras recebem `valor × odd` de volta e o extrato é atualizado automaticamente.
- A odd é “congelada” no momento da aposta — alterá-la depois no admin não muda apostas já feitas.
