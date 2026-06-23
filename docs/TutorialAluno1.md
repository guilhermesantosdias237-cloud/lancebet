# Tutorial: CRUD de Times/Participantes + select no formulário de evento

## Setup — preparando seu computador do zero

Antes de mexer no código, você precisa deixar a máquina pronta. Esta seção ensina tudo desde o começo:
instalar os programas, baixar o projeto, ligar o backend e o frontend. Se você já tem alguma coisa
instalada, pode pular essa parte específica — mas leia os comandos de verificação para ter certeza de
que está tudo no lugar.

> O que é "backend" e "frontend"? O **backend** é a parte que roda escondida, no servidor: ele guarda
> os dados e responde aos pedidos. O **frontend** é a parte que você vê no navegador: telas, botões,
> formulários. Neste projeto, os dois ficam em pastas separadas (`backend` e `frontend`) e precisam
> rodar ao mesmo tempo.

### 1. Instalar os programas

Você vai precisar de quatro programas. Instale cada um e depois confirme que funcionou rodando o
comando de verificação no terminal.

**Git** — é a ferramenta que baixa o projeto e controla as versões do código (quem mudou o quê e
quando). Baixe em https://git-scm.com/downloads. Para conferir:

```bash
git --version
```

**Python 3.11 ou mais novo** — é a linguagem do backend. Baixe em https://www.python.org/downloads/.
Escolha a versão **3.11** (ou 3.12/3.13). Para conferir:

```bash
python --version
```

> Atenção a uma pegadinha deste projeto: existe um arquivo chamado `.python-version` apontando para a
> versão 3.14, que talvez **nem exista ainda** no seu computador. Não se preocupe com ele. Mais para
> frente, quando criarmos o "ambiente virtual" do Python, vamos forçar o uso da 3.11, e tudo funciona.

**Bun** — é o gerenciador de pacotes do frontend (baixa as bibliotecas que o site usa e roda o
servidor de desenvolvimento). É o que usamos no lugar do `npm`. Baixe em https://bun.sh. Para conferir:

```bash
bun --version
```

**VSCode** — é o editor de código onde você vai escrever tudo. Baixe em https://code.visualstudio.com.

### 2. Baixar o projeto (clonar o repositório)

"Clonar" significa baixar uma cópia completa do projeto para o seu computador. Abra o terminal, vá
até a pasta onde você guarda seus projetos e rode:

```bash
git clone https://github.com/guilhermesantosdias237-cloud/lancebet.git
```

Isso cria uma pasta `lancebet` com tudo dentro. Entre nela:

```bash
cd lancebet
```

### 3. Criar uma branch para o seu trabalho

Antes de começar a mexer no código, crie uma **branch** (uma "ramificação" do projeto). Pense nela
como uma cópia paralela onde você trabalha à vontade sem bagunçar a versão principal. Se algo der
errado, é só voltar para a branch principal e a sua confusão fica isolada.

```bash
git checkout -b minha-feature
```

O `-b` cria a branch nova e já te leva para dentro dela. A partir daqui, todas as suas mudanças ficam
nessa branch separada.

### 4. Preparar o backend

O backend usa um **ambiente virtual** (chamado `.venv`): uma "caixa" isolada onde ficam as bibliotecas
do Python só deste projeto, sem misturar com o resto do seu computador. Entre na pasta `backend` e
crie o ambiente forçando o Python 3.11:

```bash
cd backend
python3.11 -m venv .venv
```

> Por que `python3.11` e não só `python`? Para garantir que o ambiente use a versão certa e ignorar a
> 3.14 que o arquivo `.python-version` pede. Se no seu sistema o comando do Python 3.11 tiver outro
> nome, use o que funcionar (ex.: `python3`), contanto que `python --version` dentro do ambiente
> mostre 3.11 ou superior.

Agora **ative** o ambiente (isso liga a "caixa"):

```bash
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

Com o ambiente ativo, instale as bibliotecas que o backend precisa:

```bash
pip install -r requirements.txt
```

### 5. Preparar o frontend

Abra **outro** terminal (deixe o do backend aberto), vá até a pasta `frontend` e instale as
bibliotecas com o Bun:

```bash
cd frontend
bun install
```

### 6. Ligar tudo

Com os dois preparados, é hora de rodar. Use dois terminais ao mesmo tempo.

**Terminal do backend** (a partir da pasta `backend`, com o `.venv` ativo):

```bash
.venv/bin/python main.py
```

**Terminal do frontend** (a partir da pasta `frontend`):

```bash
bun run dev
```

Pronto. O backend sobe a API e o frontend abre o site no navegador. As portas e o endereço exato
aparecem mais abaixo, na seção **Pré-requisitos**.

### 7. Extensões recomendadas do VSCode

No VSCode, abra a aba de extensões (ícone de blocos na barra lateral) e instale estas. Cada uma deixa
sua vida mais fácil de um jeito:

- **Python** — dá suporte básico à linguagem Python (rodar, depurar, reconhecer arquivos `.py`).
- **Pylance** — autocompletar inteligente e checagem de tipos enquanto você digita Python.
- **Python Debugger** — permite pausar o código e investigar o que está acontecendo passo a passo.
- **Python Environments** — ajuda a escolher e gerenciar o ambiente virtual (`.venv`) certo.
- **ESLint** — aponta erros e problemas de estilo no código do frontend (JavaScript/TypeScript).
- **SQLite3 Editor** — abre e mostra o banco de dados SQLite direto no editor, sem ferramenta extra.
- **vscode-icons** — coloca ícones bonitos nos arquivos e pastas, facilitando achar as coisas.
- **HTML CSS Support** — autocompletar para HTML e CSS nas telas.

> Dica sobre o gerenciador de pacotes: neste projeto o gerenciador oficial do frontend é o **Bun**,
> não o `npm`. Se em algum comando você vir `npm`, troque pelo equivalente em `bun` (ex.: `npm install`
> vira `bun install`, `npm run dev` vira `bun run dev`).

---

Bem-vindo(a)! Este tutorial é **passo a passo** e foi escrito para quem está começando. Vamos
implementar uma feature inteira no projeto **LanceBet**, do banco de dados até a tela. Siga **na
ordem**, copie os códigos **exatamente** como estão e leia as explicações curtas embaixo de cada
bloco. Se você seguir tudo ao pé da letra, no final terá a feature funcionando.

> Dica importante: **não pule etapas**. Cada arquivo depende do anterior. O erro número 1 dos
> alunos é esquecer de **registrar a tabela** e **registrar o router** no `main.py`. Tem uma seção
> inteira sobre isso aqui.

---

## O que você vai construir

Você vai criar um **cadastro de Times/Participantes** e depois usar esse cadastro para **trocar os
dois campos de texto** ("Mandante" e "Visitante") do formulário de criar evento por **duas caixas de
seleção** (os tais `<select>`) que listam os times já cadastrados — mostrando até o **escudo** de
cada um.

O cadastro vai ser um **CRUD** completo, só para administradores. CRUD é a sigla das quatro coisas
básicas que dá para fazer com um dado: **C**reate (criar), **R**ead (ler/listar), **U**pdate
(atualizar) e **D**elete (apagar). Ou seja: criar um time, ver a lista, editar e excluir.

Resultado final:

- Uma tabela nova no banco: `participante` (campos: `id`, `nome`, `escudo_url`, `esporte`, `ativo`).
- Camada de acesso a dados (repo + SQL puro) espelhando o módulo de evento.
- DTOs de entrada (`CriarParticipanteDTO`, `AtualizarParticipanteDTO`) e DTO de saída (`ParticipanteResponse`).
  Um **DTO** ("Data Transfer Object", objeto de transferência de dados) é só uma caixinha que define
  quais campos entram e quais campos saem da API, com as regras de validação. "De entrada" é o que o
  usuário manda; "de saída" é o que a API devolve.
- Um router admin de times com CRUD (`/api/admin/times`) e um endpoint público de listagem para o select.
  Um **endpoint** é um endereço da API que aceita um pedido (por exemplo, `GET /api/times` significa
  "me dê a lista de times").
- O cliente do front (`participantesApi` em `api.ts`), o tipo (`types.ts`) e o schema Zod (`schemas.ts`).
- Uma página nova **AdminTimesPage** (`/admin/times`) para gerenciar os times.
- O formulário de evento (**AdminEventosPage**) com **dois selects** de mandante/visitante mostrando o escudo.
- Um item de menu novo "Times" no cabeçalho do admin.

---

## Pré-requisitos

Você precisa conseguir **rodar o backend e o frontend** na sua máquina. Abra **dois terminais**.

**Terminal 1 — Backend** (a partir da pasta do projeto):

```bash
cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend
.venv/bin/python main.py
```

Isso liga a API. A porta vem do arquivo `backend/.env` (`PORT`, valor padrão `8413`). A documentação
interativa — uma página onde dá para testar a API direto no navegador — fica em
`http://localhost:8413/docs`.

> Atenção: o `.python-version` aponta para uma versão de Python que pode não estar instalada.
> **Sempre** use o Python de dentro do ambiente virtual: `.venv/bin/python`. Não use só `python`,
> senão você corre o risco de usar o Python errado.

**Terminal 2 — Frontend** (a partir da pasta `frontend`):

```bash
cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend
bun run dev
```

O Vite (a ferramenta que monta e serve o frontend) liga o site na porta `5183` e redireciona os
pedidos de `/api` para o backend. Abra `http://localhost:5183` no navegador.

**Login de administrador** (necessário para ver as telas de admin):

- E-mail: `lancebet@ifes.site`
- Senha: `Admin!123`

Para conferir os tipos do front sem ligar nada (útil ao terminar), rode na pasta `frontend`:

```bash
bunx tsc -b --noEmit
```

---

## As camadas que vamos tocar e a ORDEM de implementação

O LanceBet é organizado em **camadas** — cada parte do código tem uma responsabilidade só, e uma
camada conversa com a de baixo. No backend a ordem é `Routes → DTOs → Repos → SQL → DB` (das telas
até o banco). No frontend: `api.ts → types.ts → schemas.ts → páginas → router`. Separar assim deixa
o código mais fácil de entender e de mexer.

Vamos construir **de baixo para cima** (do banco até a tela). A ordem é esta:

1. **SQL** (`backend/sql/participante_sql.py`) — as queries da tabela nova.
2. **Model** (`backend/model/participante_model.py`) — a dataclass + enum.
3. **Repo** (`backend/repo/participante_repo.py`) — funções que executam o SQL.
4. **DTOs de entrada** (`backend/dtos/participante_dto.py`) — validação do que chega.
5. **DTO de saída / Response** (`backend/dtos/responses/participante_response.py`) — o que sai.
6. **Router** (`backend/routes/admin_times_routes.py`) — os endpoints HTTP.
7. **Registrar tabela + router no startup** (`backend/main.py`) — **o passo que todo mundo esquece**.
8. **Tipo no front** (`frontend/src/lib/types.ts`).
9. **Schema Zod** (`frontend/src/lib/schemas.ts`).
10. **Cliente HTTP** (`frontend/src/lib/api.ts`) — `participantesApi`.
11. **Página nova** (`frontend/src/pages/admin/AdminTimesPage.tsx`).
12. **Trocar os campos por selects** (`frontend/src/pages/admin/AdminEventosPage.tsx`).
13. **Registrar a rota da página** (`frontend/src/router.tsx`).
14. **Adicionar item no menu** (`frontend/src/components/lancebet/Header.tsx`).

**Por que essa ordem?** Cada camada usa a de baixo. O repo usa o SQL e o model; o router usa o DTO, o
response e o repo; o frontend usa aquilo que o backend disponibiliza. Construindo de baixo para cima,
quando você chega numa camada, tudo que ela precisa **já existe**. Se você começasse pela tela,
ficaria chamando coisas que ainda nem foram criadas — e nada funcionaria.

---

## Passo 1 — SQL da tabela `participante`

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/sql/participante_sql.py`
**Tipo:** ARQUIVO NOVO

Este projeto **não usa ORM** (uma ferramenta que escreveria o SQL por você automaticamente). Aqui,
todo o SQL é escrito à mão, guardado em variáveis de texto, com `?` no lugar dos valores. Esse `?` é
o que se chama de "prepared statement": em vez de grudar o valor direto na consulta, você deixa o
banco preencher com segurança — isso evita um ataque clássico chamado SQL injection. Crie o arquivo
com o conteúdo abaixo, copiando o estilo de `backend/sql/evento_sql.py`.

```python
"""
SQL puro do módulo de participantes (times do LanceBet).

Todas as queries usam prepared statements (placeholders ``?``). Espelha o
estilo de ``sql/evento_sql.py``.
"""

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
```

Pontos importantes:

- **Nomes em `MAIÚSCULA_SNAKE`**, com verbo + entidade (`CRIAR_TABELA_*`, `INSERIR_*`, `OBTER_*`...),
  igual ao módulo de evento.
- `ativo INTEGER NOT NULL DEFAULT 1` — o SQLite não tem tipo booleano; guardamos `1`/`0`.
- `escudo_url TEXT` (sem `NOT NULL`) — o escudo é **opcional**.
- `OBTER_PARTICIPANTES_BASE` + `OBTER_PARTICIPANTES_ORDER` separados: é o mesmo padrão de
  `evento_sql.py`, onde os filtros são montados em Python e o `ORDER BY` é concatenado por último.

---

## Passo 2 — Model `Participante`

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/model/participante_model.py`
**Tipo:** ARQUIVO NOVO

O model é a representação do dado em Python: uma **dataclass**, que é uma classe simples feita só para
guardar campos (igual a `model/evento_model.py`). Como `esporte` é um campo de texto livre, basta uma
`str` comum — não precisamos de uma lista fixa de opções aqui.

```python
"""
Modelo de domínio do módulo de participantes (times) do LanceBet.

Entidade SQL puro (sem ORM); o mapeamento linha->objeto fica em
``repo/participante_repo.py``.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class Participante:
    """Time/participante que pode ser mandante ou visitante de um evento."""

    id: int
    nome: str
    escudo_url: Optional[str]
    esporte: str = "Futebol"
    ativo: bool = True
```

Pontos importantes:

- `escudo_url: Optional[str]` — combina com a coluna que pode ser nula.
- `ativo: bool = True` — no model é booleano de verdade; quem converte para `1`/`0` é o repo.
- A ordem dos campos importa em dataclass: os que **não têm** valor padrão (`id`, `nome`,
  `escudo_url`) vêm **antes** dos que têm (`esporte`, `ativo`).

---

## Passo 3 — Repo `participante_repo`

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/repo/participante_repo.py`
**Tipo:** ARQUIVO NOVO

O repo (de "repositório") tem as **funções** que de fato executam o SQL e falam com o banco. Ele
espelha o `repo/evento_repo.py`: usa o `obter_conexao()` para abrir a conexão com segurança, sempre
passa os valores como **tupla** (aquela lista entre parênteses), e tem uma função interna
`_row_to_participante` que pega uma linha vinda do banco e a transforma num objeto Python.

```python
"""
Repositório de participantes (times) do LanceBet.

Segue o padrão de camadas do projeto: Routes -> DTOs -> Repos -> SQL puro
(SQLite, sem ORM, prepared statements).

Expõe ``criar_tabela()`` (chamado no startup em main.py) e o CRUD básico.
"""

import sqlite3
from typing import Optional

from model.participante_model import Participante
from sql.participante_sql import (
    CRIAR_TABELA_PARTICIPANTE,
    INSERIR_PARTICIPANTE,
    OBTER_PARTICIPANTE_POR_ID,
    OBTER_PARTICIPANTES_BASE,
    OBTER_PARTICIPANTES_ORDER,
    ATUALIZAR_PARTICIPANTE,
    EXCLUIR_PARTICIPANTE,
)
from util.db_util import obter_conexao


# =============================================================================
# Mapeador linha -> objeto
# =============================================================================

def _row_to_participante(row: sqlite3.Row) -> Participante:
    return Participante(
        id=row["id"],
        nome=row["nome"],
        escudo_url=row["escudo_url"],
        esporte=row["esporte"],
        ativo=bool(row["ativo"]),
    )


# =============================================================================
# Criação de tabela
# =============================================================================

def criar_tabela() -> bool:
    """Cria a tabela participante."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA_PARTICIPANTE)
        return True


# =============================================================================
# CRUD
# =============================================================================

def criar(participante: Participante) -> Optional[int]:
    """Insere um participante. Retorna o id criado."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            INSERIR_PARTICIPANTE,
            (
                participante.nome,
                participante.escudo_url,
                participante.esporte,
                1 if participante.ativo else 0,
            ),
        )
        return cursor.lastrowid


def obter_por_id(id: int) -> Optional[Participante]:
    """Retorna o participante pelo id, ou None."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_PARTICIPANTE_POR_ID, (id,))
        row = cursor.fetchone()
        return _row_to_participante(row) if row else None


def listar(apenas_ativos: bool = False) -> list[Participante]:
    """Lista participantes ordenados por nome. Filtra por ativos se pedido."""
    clausulas: list[str] = []
    params: list = []

    if apenas_ativos:
        clausulas.append("ativo = ?")
        params.append(1)

    sql = OBTER_PARTICIPANTES_BASE
    if clausulas:
        sql += " WHERE " + " AND ".join(clausulas)
    sql += OBTER_PARTICIPANTES_ORDER

    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        return [_row_to_participante(r) for r in cursor.fetchall()]


def atualizar(participante: Participante) -> bool:
    """Atualiza os dados de um participante. Retorna True se algo mudou."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(
            ATUALIZAR_PARTICIPANTE,
            (
                participante.nome,
                participante.escudo_url,
                participante.esporte,
                1 if participante.ativo else 0,
                participante.id,
            ),
        )
        return cursor.rowcount > 0


def excluir(id: int) -> bool:
    """Exclui um participante pelo id. Retorna True se excluiu algo."""
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(EXCLUIR_PARTICIPANTE, (id,))
        return cursor.rowcount > 0
```

Pontos importantes:

- **`with obter_conexao() as conn:`** — essa estrutura (de `util/db_util.py`) cuida da conexão para
  você: salva as mudanças (`commit`) se deu tudo certo, desfaz (`rollback`) se deu erro, e já configura
  o banco para você ler os campos pelo nome (por isso funciona `row["nome"]`).
- **Sempre passe os valores como tupla**: `cursor.execute(SQL, (a, b, c))`. **Nunca** cole os valores
  direto no texto do SQL — isso abre a brecha de SQL injection e foge do padrão do projeto.
- `criar` devolve `cursor.lastrowid` (o id que acabou de ser criado). `atualizar` e `excluir` devolvem
  `cursor.rowcount > 0` (ou seja, `True` se mexeram em alguma linha). É o **mesmo formato de função**
  do `evento_repo`.
- A função `criar_tabela()` é o que o `main.py` vai chamar no startup (Passo 7).

---

## Passo 4 — DTOs de entrada

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/dtos/participante_dto.py`
**Tipo:** ARQUIVO NOVO

O DTO de entrada confere se o que **chega** na API está certo (por exemplo: o nome não pode ser vazio).
Usamos `pydantic.BaseModel` com `Field(...)` e `field_validator`, reaproveitando o validador
`validar_string_obrigatoria` de `dtos/validators.py` (o mesmo que o `evento_dto.py` usa). Quando uma
validação falha, o FastAPI já devolve sozinho um erro **422** (o código que significa "você mandou um
dado inválido").

```python
"""
DTOs de entrada do módulo de participantes (times) do LanceBet.

Cobre criação e edição de participantes. As regras de validação seguem o
mesmo estilo de ``dtos/evento_dto.py`` (validators reutilizáveis de
``dtos/validators.py``).
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria


class CriarParticipanteDTO(BaseModel):
    """Cria um novo participante (time)."""

    nome: str = Field(..., description="Nome do time/participante")
    escudo_url: Optional[str] = Field(default=None, description="URL do escudo (opcional)")
    esporte: str = Field(default="Futebol", description="Esporte do participante")
    ativo: bool = Field(default=True, description="Se o participante está ativo")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=80)
    )


class AtualizarParticipanteDTO(BaseModel):
    """Atualiza os dados de um participante existente."""

    nome: str = Field(..., description="Nome do time/participante")
    escudo_url: Optional[str] = Field(default=None, description="URL do escudo (opcional)")
    esporte: str = Field(default="Futebol", description="Esporte do participante")
    ativo: bool = Field(default=True, description="Se o participante está ativo")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=80)
    )
```

Pontos importantes:

- `Field(...)` (com as três bolinhas) quer dizer **campo obrigatório**. `Field(default=...)` dá um
  valor pronto quando o usuário não manda nada (campo opcional).
- `validar_string_obrigatoria(nome_campo=..., tamanho_minimo=..., tamanho_maximo=...)` é uma função que
  **fabrica outra função** de validação (chamamos isso de factory). É por isso que ela aparece chamada
  duas vezes: `field_validator("nome")(validar_string_obrigatoria(...))` — exatamente como em
  `evento_dto.py`.
- Os dois DTOs são praticamente iguais aqui; mantê-los separados deixa claro qual é "criar" e qual é
  "atualizar", e segue o padrão do projeto (que tem `CriarEventoDTO` e `AtualizarEventoDTO`).

---

## Passo 5 — DTO de saída (Response)

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/dtos/responses/participante_response.py`
**Tipo:** ARQUIVO NOVO

O Response define o **formato exato** daquilo que a API devolve. Ele tem que ser igualzinho ao tipo do
frontend (que você cria no Passo 8) — se um lado mandar um campo que o outro não espera, o dado se
perde. Use o método de fábrica `de_participante(model)`, igual ao `de_evento` em `evento_response.py`.

```python
"""
Schema de resposta do módulo de participantes (times).

Os campos espelham EXATAMENTE o tipo do frontend
(frontend/src/lib/types.ts -> interface Participante).
"""

from typing import Optional

from pydantic import BaseModel, Field

from model.participante_model import Participante


class ParticipanteResponse(BaseModel):
    """Representação de um participante (time) para o frontend."""

    id: int
    nome: str
    escudo_url: Optional[str] = None
    esporte: str
    ativo: bool = Field(..., description="Se o participante está ativo")

    @classmethod
    def de_participante(cls, p: Participante) -> "ParticipanteResponse":
        return cls(
            id=p.id,
            nome=p.nome,
            escudo_url=p.escudo_url,
            esporte=p.esporte,
            ativo=p.ativo,
        )
```

Pontos importantes:

- O Response é separado do DTO de entrada de propósito: o que **entra** e o que **sai** podem ter
  campos diferentes (por exemplo, a saída tem `id`, mas a entrada não, porque o id só existe depois de
  o time ser criado).
- O método `de_participante` recebe o **model** e devolve o **response**. Monte o response sempre por
  ele (igual o router faz com `EventoResponse.de_evento`), para não esquecer nenhum campo.
- Os nomes dos campos aqui (`id`, `nome`, `escudo_url`, `esporte`, `ativo`) **têm que ser idênticos**
  aos da interface TypeScript no Passo 8. Se um lado mudar, o outro tem que mudar junto.

---

## Passo 6 — Router admin de times

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/routes/admin_times_routes.py`
**Tipo:** ARQUIVO NOVO

Aqui ficam os **endpoints** (os endereços da API). Vamos criar **dois routers** — um router é só um
grupo de endpoints que combinam entre si:

- `admin_router` (começa com `/admin/times`): o CRUD, protegido para que só o perfil **Administrador**
  acesse.
- `router` (começa com `/times`): um endereço **público** de listagem (um `GET`) que as caixas de
  seleção do formulário vão usar para pegar os times.

Use como molde o `routes/admin_usuarios_routes.py` (que tem um CRUD de admin) e o
`routes/evento_routes.py` (que também junta um router público e um de admin no mesmo arquivo).

```python
# =============================================================================
# Rotas de Administração de Times/Participantes (API JSON)
# =============================================================================

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Response, status

# DTOs (entrada)
from dtos.participante_dto import CriarParticipanteDTO, AtualizarParticipanteDTO

# Schemas (saída)
from dtos.responses.participante_response import ParticipanteResponse

# Models
from model.participante_model import Participante
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import participante_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger
from util.perfis import Perfil

# =============================================================================
# Routers
# =============================================================================

# Listagem pública para alimentar o <select> de mandante/visitante.
router = APIRouter(prefix="/times")
# CRUD restrito a administradores.
admin_router = APIRouter(prefix="/admin/times")


# =============================================================================
# Helpers
# =============================================================================

def _obter_participante_ou_404(id: int) -> Participante:
    """Carrega o participante ou lança 404."""
    participante = participante_repo.obter_por_id(id)
    if not participante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante não encontrado.",
        )
    return participante


# =============================================================================
# Rota pública — listagem para o select
# =============================================================================

@router.get("", response_model=list[ParticipanteResponse])
async def listar_times(request: Request):
    """Lista os participantes ATIVOS (usado no select do formulário de evento)."""
    participantes = participante_repo.listar(apenas_ativos=True)
    return [ParticipanteResponse.de_participante(p) for p in participantes]


# =============================================================================
# Rotas admin — CRUD
# =============================================================================

@admin_router.get("", response_model=list[ParticipanteResponse])
@requer_autenticacao([Perfil.ADMIN.value])
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista TODOS os participantes (ativos e inativos) para o painel admin."""
    assert usuario_logado is not None
    participantes = participante_repo.listar()
    return [ParticipanteResponse.de_participante(p) for p in participantes]


@admin_router.post(
    "",
    response_model=ParticipanteResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao([Perfil.ADMIN.value])
async def criar(
    request: Request,
    dto: CriarParticipanteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria um novo participante (time)."""
    assert usuario_logado is not None

    participante = Participante(
        id=0,
        nome=dto.nome,
        escudo_url=dto.escudo_url,
        esporte=dto.esporte,
        ativo=dto.ativo,
    )
    participante_id = participante_repo.criar(participante)
    if not participante_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar participante. Tente novamente.",
        )

    logger.info(f"Participante #{participante_id} criado por admin {usuario_logado.id}")
    return ParticipanteResponse.de_participante(_obter_participante_ou_404(participante_id))


@admin_router.put("/{id}", response_model=ParticipanteResponse)
@requer_autenticacao([Perfil.ADMIN.value])
async def alterar(
    request: Request,
    id: int,
    dto: AtualizarParticipanteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza os dados de um participante."""
    assert usuario_logado is not None
    _obter_participante_ou_404(id)

    participante = Participante(
        id=id,
        nome=dto.nome,
        escudo_url=dto.escudo_url,
        esporte=dto.esporte,
        ativo=dto.ativo,
    )
    if not participante_repo.atualizar(participante):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao alterar participante. Tente novamente.",
        )

    logger.info(f"Participante {id} alterado por admin {usuario_logado.id}")
    return ParticipanteResponse.de_participante(_obter_participante_ou_404(id))


@admin_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
@requer_autenticacao([Perfil.ADMIN.value])
async def excluir(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Exclui um participante."""
    assert usuario_logado is not None
    _obter_participante_ou_404(id)

    if not participante_repo.excluir(id):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir participante. Tente novamente.",
        )

    logger.info(f"Participante {id} excluído por admin {usuario_logado.id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

Pontos importantes (leia com calma, é a parte mais cheia de detalhes):

- **O prefixo NÃO inclui `/api`.** O `main.py` coloca o `/api` na frente sozinho. Então
  `prefix="/admin/times"` vira `/api/admin/times` na prática.
- **`@requer_autenticacao([Perfil.ADMIN.value])`** fica **logo abaixo** da linha que define a rota
  (`@admin_router.post(...)`). Sem ele, qualquer pessoa poderia acessar. Com a lista de perfis, só
  Administrador entra. Quem não está logado recebe 401; quem está logado mas não é admin recebe 403.
- Por causa desse decorator, a função **sempre** declara
  `usuario_logado: Optional[UsuarioLogado] = None` e logo no começo faz `assert usuario_logado is not None`
  (uma checagem que garante que o usuário realmente chegou). O `usuario_logado` é uma **dataclass**,
  nunca um dicionário.
- **O primeiro parâmetro é sempre `request: Request`.** Os valores que vêm pela URL (como `id: int`)
  vêm depois.
- O endereço **público** `listar_times` (no `router`, começando com `/times`) **não tem** o decorator
  de autenticação — é justamente o que as caixas de seleção vão chamar. Ele devolve **só os times
  ativos**.
- Use `Perfil.ADMIN.value` (de `util/perfis.py`), **nunca** a palavra `"Administrador"` digitada solta
  (assim, se o nome mudar, muda num lugar só).
- Para erros, dispare `HTTPException(status_code=..., detail="...")`. O projeto já cuida de formatar a
  resposta de erro no padrão `{detail, type, errors}`.
- O `DELETE` devolve `204 No Content` (uma resposta de sucesso sem nenhum conteúdo no corpo), via
  `Response(status_code=...)`.

> Observação: o módulo de evento usa um limitador de requisições (`DynamicRateLimiter`) em algumas
> rotas — ele evita que alguém faça pedidos demais em pouco tempo. Aqui, para o tutorial não ficar
> pesado, **não** vamos aplicar esse limitador. Se quiser seguir 100% o padrão do `admin_usuarios`,
> dá para adicionar depois — mas é opcional e esta feature não exige.

---

## Passo 7 — Registrar a tabela e o router no `main.py` (NÃO PULE!)

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend/main.py`
**Tipo:** EDIÇÃO

Este é **o passo que mais gente esquece**. Se você não fizer isto, a tabela nunca é criada (e aparece
o erro "no such table: participante") e os endpoints respondem 404 (porque o router não foi avisado de
que existe). São **3 edições** neste arquivo. Por que registrar? O `main.py` é o "ponto de partida" do
backend: o que não estiver listado lá, o programa nem sabe que existe.

### 7.1 — Importar o repo novo

Procure o bloco de imports de repositórios (perto da linha 33), que está assim:

```python
# Repositórios do LanceBet (carteira, eventos, apostas)
from repo import carteira_repo, evento_repo, aposta_repo
```

Adicione o `participante_repo` à lista de import:

```python
# Repositórios do LanceBet (carteira, eventos, apostas)
from repo import carteira_repo, evento_repo, aposta_repo, participante_repo
```

### 7.2 — Importar o router novo

Logo abaixo dos imports de routers do LanceBet (depois do `from routes.carteira_routes import ...`,
perto da linha 52), adicione:

```python
from routes.admin_times_routes import (
    router as times_router,
    admin_router as admin_times_router,
)
```

### 7.3 — Registrar a tabela na lista `TABELAS`

Procure a lista `TABELAS` (perto da linha 99). Ela é percorrida no startup chamando
`repo.criar_tabela()` para cada item. Adicione a tupla do participante:

```python
TABELAS = [
    (usuario_repo, "usuario"),
    # LanceBet: ordem de dependência. evento_repo cria evento_esportivo +
    # opcao_aposta; aposta referencia opcao_aposta; carteira_repo cria carteira
    # + movimentacao_financeira (movimentacao tem FK para aposta).
    (evento_repo, "evento_esportivo + opcao_aposta"),
    (aposta_repo, "aposta"),
    (carteira_repo, "carteira + movimentacao_financeira"),
    # Cadastro de times/participantes (independente, sem FK).
    (participante_repo, "participante"),
    # Infra de configuração (settings em runtime, lida por util/config.py).
    (configuracao_repo, "configuracao"),
]
```

> Por que a posição importa? A lista respeita as **chaves estrangeiras (FK)** — quando uma tabela
> aponta para outra, a tabela apontada precisa nascer primeiro. Como `participante` **não aponta para
> ninguém**, ela pode ir em quase qualquer lugar; colocamos antes de `configuracao` só por organização.

### 7.4 — Registrar os routers na lista `ROUTERS`

Procure a lista `ROUTERS` (perto da linha 137). Ela é percorrida montando cada router sob o prefixo
`/api`. Adicione os dois routers novos:

```python
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (admin_usuarios_router, ["Admin - Usuários"], "admin de usuários"),
    # LanceBet
    (eventos_router, ["Eventos"], "eventos (público)"),
    (apostas_router, ["Apostas"], "apostas"),
    (carteira_router, ["Carteira"], "carteira"),
    (admin_eventos_router, ["Admin - Eventos"], "admin de eventos"),
    (admin_opcoes_router, ["Admin - Eventos"], "admin de opções"),
    (admin_apostas_router, ["Admin - Apostas"], "admin de apostas"),
    (admin_liquidacao_router, ["Admin - Eventos"], "admin de liquidação"),
    (admin_dashboard_router, ["Admin - Dashboard"], "admin dashboard"),
    # Times/participantes
    (times_router, ["Times"], "times (público)"),
    (admin_times_router, ["Admin - Times"], "admin de times"),
]
```

Pronto. Agora, ao subir o backend, você verá nos logs `Tabela 'participante' criada/verificada` e
`Router de times (público) incluído em /api`. Se não aparecer, alguma das edições acima ficou
faltando.

**Confira rápido:** com o backend rodando, abra `http://localhost:8413/docs`. Devem aparecer as
seções **Times** e **Admin - Times** com os endpoints novos. Se aparecerem, o backend está pronto.

---

## Passo 8 — Tipo no front (`types.ts`)

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/lib/types.ts`
**Tipo:** EDIÇÃO

Os tipos do frontend têm que ser **idênticos** aos Response DTOs do backend — é assim que o
TypeScript sabe o formato dos dados que chegam. Adicione a interface `Participante` no final do
arquivo (depois de `UsuarioAdmin`):

```typescript
// ===== Times / Participantes =====
export interface Participante {
  id: number
  nome: string
  escudo_url: string | null
  esporte: string
  ativo: boolean
}
```

Pontos importantes:

- Os nomes e tipos têm que **bater** com `ParticipanteResponse` do Passo 5:
  `id: number` ↔ `id: int`, `escudo_url: string | null` ↔ `escudo_url: Optional[str]`,
  `ativo: boolean` ↔ `ativo: bool`.
- Não invente campos novos: o que o backend não manda, o front não declara.

---

## Passo 9 — Schema Zod (`schemas.ts`)

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/lib/schemas.ts`
**Tipo:** EDIÇÃO

O schema Zod confere o **formulário** ainda no navegador, antes de mandar qualquer coisa para a API.
Ele copia as mesmas regras do DTO de entrada do Passo 4 — assim o usuário vê o erro na hora, sem
precisar esperar a resposta do servidor. Adicione no final do arquivo:

```typescript
// ===== Admin: times / participantes =====

export const participanteSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(80, 'O nome deve ter no máximo 80 caracteres'),
  escudo_url: z.string().optional().default(''),
  esporte: z.string().min(1, 'Informe o esporte').default('Futebol'),
  ativo: z.boolean().default(true),
})
export type ParticipanteForm = z.infer<typeof participanteSchema>
```

Pontos importantes:

- O `min(2)`/`max(80)` espelham o `validar_string_obrigatoria(tamanho_minimo=2, tamanho_maximo=80)`
  do backend. Quando os dois lados batem, o usuário recebe o erro **no front** antes mesmo de chamar
  a API.
- `z.infer<typeof participanteSchema>` gera o tipo `ParticipanteForm` automaticamente — você vai usar
  esse tipo no `api.ts` (Passo 10).
- `import { z } from 'zod'` já existe no topo do arquivo; não precisa importar de novo.

---

## Passo 10 — Cliente HTTP (`api.ts`)

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/lib/api.ts`
**Tipo:** EDIÇÃO

Toda chamada à API passa por um objeto central chamado `api` (ele já cuida sozinho do cookie de login
e da proteção contra CSRF — um tipo de ataque em que um site malicioso faz pedidos no seu nome). Você
só precisa criar um objeto `participantesApi` com as funções deste módulo. São **2 edições**.

### 10.1 — Importar o tipo `Participante`

Procure o bloco `import type { ... } from './types'` (perto da linha 168). Adicione `Participante`
à lista:

```typescript
import type {
  Usuario,
  Evento,
  OpcaoAposta,
  Aposta,
  ApostaComSaldo,
  Carteira,
  MovimentacaoFinanceira,
  EventoAdmin,
  AdminDashboard,
  LiquidacaoResultado,
  UsuarioAdmin,
  Participante,
  PaginaResponse,
  MensagemResponse,
} from './types'
```

E no bloco `import type { ... } from './schemas'` logo abaixo, adicione `ParticipanteForm`:

```typescript
import type {
  CadastroApostadorForm,
  CriarApostaForm,
  CriarEventoForm,
  AdicionarOpcaoForm,
  LiquidarEventoForm,
  ParticipanteForm,
} from './schemas'
```

### 10.2 — Criar o objeto `participantesApi`

No **final do arquivo** (depois do `adminApi`), adicione:

```typescript
/** Times/participantes (cadastro admin + listagem pública para selects). */
export const participantesApi = {
  // Listagem pública (apenas ativos) — usada nos selects do formulário de evento.
  listar: () => api.get<Participante[]>('/times'),

  // CRUD admin.
  listarAdmin: () => api.get<Participante[]>('/admin/times'),
  criar: (dados: ParticipanteForm) => api.post<Participante>('/admin/times', dados),
  alterar: (id: number, dados: ParticipanteForm) =>
    api.put<Participante>(`/admin/times/${id}`, dados),
  excluir: (id: number) => api.delete<void>(`/admin/times/${id}`),
}
```

Pontos importantes:

- **Os caminhos já contam a partir de `/api`** — o cliente coloca o `/api` sozinho. Por isso você
  escreve `/times`, e não `/api/times`.
- `api.get<Participante[]>('/times')` — o `<Participante[]>` avisa ao TypeScript qual é o **tipo do
  que volta**. Como o backend devolve uma lista simples (sem paginação), o tipo é um array, e não
  `PaginaResponse<...>`.
- `api.post`/`api.put` mandam o corpo em JSON, com a proteção CSRF automática. Usamos
  `api.delete<void>` porque o backend responde `204` sem nenhum conteúdo.

---

## Passo 11 — Página nova `AdminTimesPage`

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/pages/admin/AdminTimesPage.tsx`
**Tipo:** ARQUIVO NOVO

Esta é a tela onde o admin gerencia os times. Ela segue a mesma estrutura do `AdminEventosPage.tsx`:
busca os dados com `useFetch`, confere o formulário com Zod e avisa o usuário com `toast` (aquelas
mensagens que aparecem e somem). Nunca use os `alert`/`confirm` do navegador — sempre `toast` ou
`pedirConfirmacao` do uiStore. O estilo aqui é **inline** (escrito direto no elemento, sem framework
de CSS).

Quando estiver pronta, a tela vai ficar assim — com a lista de times à esquerda (mostrando o escudo) e
o formulário de cadastro à direita:

![Tela "Gerenciar times" com o time Santos cadastrado e o escudo ao lado do nome](img/aluno1/crud-times-santos-escudo.png)

```tsx
// Gerenciar times/participantes (rota /admin/times).
// Lógica: GET /api/admin/times, POST /api/admin/times,
// PUT /api/admin/times/{id}, DELETE /api/admin/times/{id}.
import { useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
import { participantesApi, ApiError } from '../../lib/api'
import { participanteSchema } from '../../lib/schemas'
import type { ParticipanteForm } from '../../lib/schemas'
import type { Participante } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Button } from '../../components/lancebet/ui'
import { toast, useUIStore } from '../../store/uiStore'
import { escudoDeTime } from '../../lib/imagens'

const labelStyle: CSSProperties = { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }
const inputStyle: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid #DCDCDC', fontSize: 14, marginBottom: 13 }

interface FormState {
  nome: string
  esporte: string
  ativo: boolean
}

const emptyForm: FormState = { nome: '', esporte: 'Futebol', ativo: true }

export default function AdminTimesPage() {
  const carregar = useCallback(() => participantesApi.listarAdmin(), [])
  const { data, carregando, erro, recarregar } = useFetch<Participante[]>(carregar, [])
  // `pedirConfirmacao` é método do store, não export standalone (só `toast` é).
  // Mesmo padrão de AdminUsuariosPage/AdminResultadoPage: ler via seletor do hook.
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [enviando, setEnviando] = useState(false)

  const times = data ?? []

  const submit = async () => {
    // Tenta achar o escudo a partir do nome (igual ao usado nos cards do app).
    const escudo = escudoDeTime(form.nome.trim())
    const dto: ParticipanteForm = {
      nome: form.nome.trim(),
      escudo_url: escudo ?? '',
      esporte: form.esporte.trim() || 'Futebol',
      ativo: form.ativo,
    }
    const parsed = participanteSchema.safeParse(dto)
    if (!parsed.success) {
      toast.erro(parsed.error.issues[0]?.message || 'Verifique os dados do time.')
      return
    }
    setEnviando(true)
    try {
      if (editandoId === null) {
        await participantesApi.criar(parsed.data)
        toast.sucesso('Time criado com sucesso.')
      } else {
        await participantesApi.alterar(editandoId, parsed.data)
        toast.sucesso('Time atualizado com sucesso.')
      }
      setForm(emptyForm)
      setEditandoId(null)
      recarregar()
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao salvar o time.')
    } finally {
      setEnviando(false)
    }
  }

  const editar = (p: Participante) => {
    setEditandoId(p.id)
    setForm({ nome: p.nome, esporte: p.esporte, ativo: p.ativo })
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setForm(emptyForm)
  }

  const excluir = (p: Participante) => {
    pedirConfirmacao({
      mensagem: `Excluir o time "${p.nome}"? Esta ação não pode ser desfeita.`,
      tipo: 'danger',
      onConfirmar: async () => {
        try {
          await participantesApi.excluir(p.id)
          toast.sucesso('Time excluído.')
          recarregar()
        } catch (e) {
          toast.erro(e instanceof ApiError ? e.message : 'Falha ao excluir o time.')
        }
      },
    })
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Gerenciar times</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Lista */}
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 0.8fr 1.4fr', gap: 12, padding: '13px 20px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            <div>Time</div><div style={{ textAlign: 'center' }}>Esporte</div><div style={{ textAlign: 'center' }}>Ativo</div><div style={{ textAlign: 'right' }}>Ações</div>
          </div>

          {carregando && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando…</div>}
          {!carregando && erro && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Não foi possível carregar os times.</div>}
          {!carregando && !erro && times.length === 0 && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhum time cadastrado.</div>}

          {times.map((p) => {
            const escudo = p.escudo_url || escudoDeTime(p.nome)
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 0.8fr 1.4fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {escudo && <img src={escudo} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />}
                  <span style={{ fontWeight: 900, fontSize: 14 }}>{p.nome}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{p.esporte}</div>
                <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{p.ativo ? 'Sim' : 'Não'}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => editar(p)} style={{ border: '1px solid #DCDCDC', background: '#fff', color: '#000', fontSize: 12, fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => excluir(p)} style={{ border: '1px solid #000', background: '#000', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}>Excluir</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Formulário */}
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ background: '#000', color: '#fff', padding: '14px 20px', fontWeight: 800, fontSize: 13, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            {editandoId === null ? 'Cadastrar time' : 'Editar time'}
          </div>
          <div style={{ padding: '22px 20px' }}>
            <label style={labelStyle}>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Santos" style={inputStyle} />
            <label style={labelStyle}>Esporte</label>
            <input value={form.esporte} onChange={(e) => setForm({ ...form, esporte: e.target.value })} placeholder="Futebol" style={inputStyle} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 18, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              Ativo
            </label>
            <Button onClick={submit} disabled={enviando} style={{ width: '100%', padding: 14, fontSize: 13, opacity: enviando ? 0.6 : 1 }}>
              {enviando ? 'Salvando…' : editandoId === null ? 'Criar time' : 'Salvar alterações'}
            </Button>
            {editandoId !== null && (
              <button onClick={cancelarEdicao} style={{ width: '100%', marginTop: 10, padding: 12, fontSize: 12, fontWeight: 700, background: '#fff', border: '1px solid #DCDCDC', cursor: 'pointer' }}>
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
```

Pontos importantes:

- **Default export** com o **mesmo nome do arquivo** (`AdminTimesPage`). É o padrão do projeto.
- **`useFetch`** devolve `{ data, carregando, erro, recarregar }`. Mostre os estados de
  `carregando`, de `erro` e de lista vazia **antes** de percorrer o `data` — senão a tela pode quebrar
  enquanto os dados ainda não chegaram.
- **`escudoDeTime(nome)`** (de `lib/imagens.ts`) tenta descobrir o escudo a partir do nome do time
  (ex.: "Santos" → `/static/img/seed/escudo_santos.png`). Devolve `null` quando não acha um escudo —
  por isso o `&&` antes do `<img>` (só mostra a imagem se ela existir).
- **Sempre avise com `toast`** e peça confirmação com **`pedirConfirmacao`** (do `store/uiStore`).
  **Nunca** use `alert()`, `confirm()` ou `prompt()` do navegador — é proibido no projeto.
- O `try/catch/finally` do `submit`: confere os dados com `safeParse`; se passou, chama a API e
  `recarregar()`; se deu erro, mostra `toast.erro`. É o mesmo fluxo do `AdminEventosPage`.

Ao clicar em **Editar**, o formulário muda para o modo de edição (título "Editar time", botão
"Salvar alterações" e um "Cancelar edição"). Com mais times cadastrados, a lista fica assim — repare
no Coritiba marcado como inativo ("Não"), que aparece para o admin mas não vai aparecer no select:

![Tela de times no modo de edição, com Coritiba, Santos e Vasco na lista e o formulário "Editar time"](img/aluno1/form-editar-time-checkbox.png)

---

## Passo 12 — Trocar os campos de texto por selects no formulário de evento

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/pages/admin/AdminEventosPage.tsx`
**Tipo:** EDIÇÃO

Agora vamos trocar os dois campos de digitar ("Mandante" e "Visitante") por duas caixas de seleção
que listam os times cadastrados — assim o admin escolhe da lista em vez de digitar e errar o nome. São
**4 pequenas edições** neste arquivo.

### 12.1 — Importar o que falta

No topo do arquivo, junto dos outros imports, adicione o `participantesApi` e o tipo `Participante`,
e o `escudoDeTime`. Os imports atuais começam assim:

```tsx
import { adminApi, ApiError } from '../../lib/api'
import { criarEventoSchema } from '../../lib/schemas'
import type { CriarEventoForm } from '../../lib/schemas'
import type { EventoAdmin, PaginaResponse } from '../../lib/types'
```

Altere/complete para:

```tsx
import { adminApi, participantesApi, ApiError } from '../../lib/api'
import { criarEventoSchema } from '../../lib/schemas'
import type { CriarEventoForm } from '../../lib/schemas'
import type { EventoAdmin, PaginaResponse, Participante } from '../../lib/types'
import { escudoDeTime } from '../../lib/imagens'
```

### 12.2 — Buscar a lista de times dentro do componente

Logo no início da função `AdminEventosPage`, **depois** da linha do `useFetch` que já existe,
adicione um segundo `useFetch` para carregar os times ativos:

```tsx
  const carregarTimes = useCallback(() => participantesApi.listar(), [])
  const { data: times } = useFetch<Participante[]>(carregarTimes, [])
  const listaTimes = times ?? []
```

> `participantesApi.listar()` chama o GET público `/api/times` (só ativos), criado no Passo 6.

### 12.3 — Substituir os dois inputs pelos selects

Procure este trecho dentro do JSX do formulário (são as linhas com os `<input>` de mandante e
visitante):

```tsx
            <label style={labelStyle}>Mandante</label>
            <input value={form.mandante} onChange={(e) => setForm({ ...form, mandante: e.target.value })} placeholder="Ex.: Santos" style={inputStyle} />
            <label style={labelStyle}>Visitante</label>
            <input value={form.visitante} onChange={(e) => setForm({ ...form, visitante: e.target.value })} placeholder="Ex.: Vasco" style={inputStyle} />
```

Substitua-o por este (note os dois `<select>` e a prévia do escudo):

```tsx
            <label style={labelStyle}>Mandante</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
              {(() => {
                const escudo = escudoDeTime(form.mandante)
                return escudo ? <img src={escudo} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} /> : null
              })()}
              <select value={form.mandante} onChange={(e) => setForm({ ...form, mandante: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }}>
                <option value="">Selecione o mandante…</option>
                {listaTimes.map((t) => (
                  <option key={t.id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
            </div>

            <label style={labelStyle}>Visitante</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
              {(() => {
                const escudo = escudoDeTime(form.visitante)
                return escudo ? <img src={escudo} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} /> : null
              })()}
              <select value={form.visitante} onChange={(e) => setForm({ ...form, visitante: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }}>
                <option value="">Selecione o visitante…</option>
                {listaTimes.map((t) => (
                  <option key={t.id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
            </div>
```

Depois da troca, o formulário de evento passa a ter duas caixas de seleção, e o escudo do time escolhido
aparece ao lado. Veja "Santos" e "Vasco" já selecionados, cada um com seu escudo:

![Formulário "Cadastrar evento" com selects de Mandante (Santos) e Visitante (Vasco), cada um mostrando o escudo](img/aluno1/evento-selects-times-escudo.png)

Pontos importantes:

- O **valor** de cada opção é o **nome do time** (`t.nome`). O backend de evento (`CriarEventoDTO`)
  espera `mandante`/`visitante` como **texto** (o nome). Como o valor continua sendo o nome, **nada
  muda no backend** — ele recebe exatamente o que recebia antes. Você só trocou o jeito de o admin
  preencher.
- `<option value="">Selecione…</option>` é a opção vazia que aparece primeiro. Se o admin não escolher
  nada, o `criarEventoSchema` reclama (`Informe o mandante`), porque o valor fica vazio (`''`).
- `escudoDeTime(form.mandante)` mostra o escudo do time escolhido ao lado da caixa de seleção. Devolve
  `null` quando não tem escudo; por isso o `? ... : null` (só mostra se existir).
- O resto da página (`submit`, `criarEventoSchema`, etc.) **não muda em nada**: o `form.mandante`
  continua sendo um texto, só que agora preenchido pela caixa de seleção em vez do campo de digitar.

### 12.4 — Conferir o `useCallback`

O `useCallback` já é importado no topo do `AdminEventosPage` (linha 5:
`import { useCallback, useState } from 'react'`). Como o Passo 12.2 usa `useCallback`, **não precisa
mexer** no import — só confirme que ele está lá.

---

## Passo 13 — Registrar a rota da página nova no router

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/router.tsx`
**Tipo:** EDIÇÃO

Sem isto, a URL `/admin/times` não existe e o React Router cai no fallback (redireciona para a home).
São **2 edições**.

### 13.1 — Importar a página

No bloco de imports `// ===== Admin =====` (perto da linha 26), adicione:

```tsx
import AdminTimesPage from './pages/admin/AdminTimesPage'
```

### 13.2 — Adicionar a rota dentro do guard `RotaAdmin`

Procure o grupo `{ element: <RotaAdmin />, children: [ ... ] }` (perto da linha 79) e adicione a rota
de times junto das outras rotas de admin:

```tsx
          {
            element: <RotaAdmin />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/eventos', element: <AdminEventosPage /> },
              { path: '/admin/times', element: <AdminTimesPage /> },
              { path: '/admin/odds', element: <AdminOddsPage /> },
              { path: '/admin/odds/:id', element: <AdminOddsPage /> },
              { path: '/admin/resultados', element: <AdminResultadoPage /> },
              { path: '/admin/usuarios', element: <AdminUsuariosPage /> },
            ],
          },
```

Pontos importantes:

- A rota **tem que ficar dentro de `RotaAdmin`** — esse guard garante que só administradores acessem
  (anônimo vai para `/entrar`, perfil errado vai para `/painel`).
- O `path` (`/admin/times`) tem que casar com o `to` do menu (Passo 14) e com a URL que você digitar
  no navegador.

---

## Passo 14 — Adicionar o item "Times" no menu do admin

**Arquivo:** `/Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend/src/components/lancebet/Header.tsx`
**Tipo:** EDIÇÃO

O cabeçalho mostra a navegação **condicional por perfil**. Procure o bloco do **admin**
(`usuario && role === Perfil.ADMIN`), dentro dele a `<nav>` (perto da linha 104). Está assim:

```tsx
            <nav style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
              <NavLink to="/admin">Painel</NavLink>
              <NavLink to="/admin/eventos">Eventos</NavLink>
              <NavLink to="/admin/odds">Odds</NavLink>
              <NavLink to="/admin/resultados">Resultados</NavLink>
              <NavLink to="/admin/usuarios">Usuários</NavLink>
            </nav>
```

Adicione o link de Times logo após "Eventos":

```tsx
            <nav style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
              <NavLink to="/admin">Painel</NavLink>
              <NavLink to="/admin/eventos">Eventos</NavLink>
              <NavLink to="/admin/times">Times</NavLink>
              <NavLink to="/admin/odds">Odds</NavLink>
              <NavLink to="/admin/resultados">Resultados</NavLink>
              <NavLink to="/admin/usuarios">Usuários</NavLink>
            </nav>
```

Pronto! O link "Times" só aparece para quem está logado como administrador, porque está dentro do
bloco `role === Perfil.ADMIN`. No final, o menu do topo fica com o item **Times** entre "Eventos" e
"Odds":

![Menu do admin no topo da página, com o novo item "Times" entre "Eventos" e "Odds"](img/aluno1/menu-admin-times.png)

---

## Como testar

### Teste manual (fluxo completo na tela)

1. **Suba o backend** (Terminal 1):
   ```bash
   cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend
   .venv/bin/python main.py
   ```
   Confira nos logs as linhas `Tabela 'participante' criada/verificada` e
   `Router de times (público) incluído em /api`. Se não aparecerem, volte ao **Passo 7**.

2. **Suba o frontend** (Terminal 2):
   ```bash
   cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/frontend
   bun run dev
   ```

3. Abra `http://localhost:5183`, clique em **Entrar** e logue como admin
   (`lancebet@ifes.site` / `Admin!123`).

4. No menu do topo, clique em **Times**. Você deve cair em `/admin/times`.

5. **Cadastre um time**: digite "Santos" no nome, deixe "Futebol" no esporte, marque "Ativo" e clique
   **Criar time**. Deve aparecer um toast verde e o time na lista (com escudo, pois "Santos" tem
   escudo no seed).

6. Cadastre mais um, ex.: "Vasco". **Edite** um time (botão Editar), mude algo e salve. **Exclua** um
   time (botão Excluir) — deve aparecer o **modal de confirmação** (não um `confirm` nativo).

7. Vá em **Eventos** (`/admin/eventos`). No formulário "Cadastrar evento", os campos Mandante e
   Visitante agora são **caixas de seleção**. Escolha "Santos" e "Vasco" — o escudo aparece ao lado.
   Preencha as odds e clique **Criar evento**. Deve criar normalmente (toast verde, e o evento aparece
   no topo da lista):

   ![Página de eventos após criar um evento Santos x Vasco usando os selects; o novo evento aparece no topo da lista](img/aluno1/evento-criado-com-selects.png)

### Teste rápido pela documentação da API

Com o backend rodando, abra `http://localhost:8413/docs`. Procure a seção **Times** e teste o
`GET /api/times` — deve retornar a lista de times ativos em JSON. Em **Admin - Times** você vê o CRUD
(esses exigem estar logado como admin; pelo Swagger eles podem dar 401 por causa do cookie de sessão,
então o teste mais confiável do CRUD é pela tela).

### Checagem de tipos do front (recomendado antes de entregar)

Na pasta `frontend`, rode:

```bash
bunx tsc -b --noEmit
```

Se passar sem erros, os tipos do front estão consistentes. Se quiser rodar os testes do backend:

```bash
cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/lancebet/backend
.venv/bin/python -m pytest -m "not slow"
```

---

## Erros comuns e como resolver

1. **`sqlite3.OperationalError: no such table: participante`**
   Você esqueceu de registrar a tabela. Volte ao **Passo 7.1** (importar `participante_repo`) e
   **7.3** (adicionar a tupla em `TABELAS`). Reinicie o backend.

2. **`GET /api/admin/times` retorna 404 (Not Found)**
   O router não foi registrado. Volte ao **Passo 7.2** (importar os routers) e **7.4** (adicionar à
   lista `ROUTERS`). Confira em `/docs` se as seções **Times** e **Admin - Times** aparecem.

3. **Mutação (criar/editar/excluir) falha com 403 "CSRF"**
   O cliente `api.ts` já manda o header `X-CSRF-Token` automaticamente em POST/PUT/PATCH/DELETE.
   Se der 403, normalmente é sessão/cookie: confirme que você está **logado** e que a chamada passou
   pelo `participantesApi` (que usa o cliente central `api`). Nunca faça `fetch` direto na página.

4. **O front compila mas a tela mostra erro / lista vazia**
   Verifique se o **contrato bate**: os campos da interface `Participante` (Passo 8) têm que ser
   **idênticos** aos do `ParticipanteResponse` (Passo 5). Um nome trocado (ex.: `escudoUrl` no front
   vs `escudo_url` no back) faz o dado chegar `undefined`.

5. **Erro 422 ao criar time, ou a validação do front não dispara**
   O Zod (Passo 9) e o DTO (Passo 4) têm que ter as **mesmas regras**. Aqui: nome de 2 a 80
   caracteres. Se o front deixa passar e o back recusa (422), foi porque o schema Zod ficou diferente
   do `validar_string_obrigatoria`.

6. **`tsc` reclama de import não usado (`noUnusedLocals`)**
   O projeto usa TypeScript em modo strict. Se você importou algo (ex.: `Participante`) e não usou,
   o build quebra. Importe só o que for usar de fato.

7. **O select não lista nenhum time**
   Cadastre ao menos um time **ativo** em `/admin/times` primeiro. O select usa
   `participantesApi.listar()` → `GET /api/times`, que retorna **apenas ativos**. Time inativo não
   aparece no select (mas aparece na lista do admin).

---

## Checklist final

Marque cada caixa conforme conclui:

- [ ] **SQL** — criei `backend/sql/participante_sql.py` com as constantes da tabela.
- [ ] **Model** — criei `backend/model/participante_model.py` com a dataclass `Participante`.
- [ ] **Repo** — criei `backend/repo/participante_repo.py` com `criar_tabela`, `criar`, `obter_por_id`, `listar`, `atualizar`, `excluir`.
- [ ] **DTOs** — criei `backend/dtos/participante_dto.py` com `CriarParticipanteDTO` e `AtualizarParticipanteDTO`.
- [ ] **Response** — criei `backend/dtos/responses/participante_response.py` com `ParticipanteResponse.de_participante`.
- [ ] **Router** — criei `backend/routes/admin_times_routes.py` com `router` (público `/times`) e `admin_router` (CRUD `/admin/times`).
- [ ] **Startup (tabela)** — importei `participante_repo` e adicionei à lista `TABELAS` em `main.py`.
- [ ] **Startup (router)** — importei os routers e adicionei à lista `ROUTERS` em `main.py`.
- [ ] **Conferi `/docs`** — as seções **Times** e **Admin - Times** aparecem.
- [ ] **Tipo** — adicionei a interface `Participante` em `frontend/src/lib/types.ts`.
- [ ] **Zod** — adicionei `participanteSchema` + `ParticipanteForm` em `frontend/src/lib/schemas.ts`.
- [ ] **api.ts** — adicionei o objeto `participantesApi` (e os imports de `Participante`/`ParticipanteForm`).
- [ ] **Página** — criei `frontend/src/pages/admin/AdminTimesPage.tsx`.
- [ ] **Selects** — troquei os inputs de mandante/visitante por selects em `AdminEventosPage.tsx` (com escudo).
- [ ] **Rota** — registrei `/admin/times` dentro de `RotaAdmin` em `router.tsx`.
- [ ] **Menu** — adicionei o `NavLink` "Times" no bloco admin do `Header.tsx`.
- [ ] **Teste** — subi backend + frontend, cadastrei times e criei um evento usando os selects.
- [ ] **Typecheck** — rodei `bunx tsc -b --noEmit` na pasta `frontend` sem erros.

Parabéns! Se todas as caixas estão marcadas, sua feature está completa e funcionando ponta a ponta. 🎉
