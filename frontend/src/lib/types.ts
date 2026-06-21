// Tipos TypeScript espelhando os schemas de resposta do backend (dtos/responses/).
// Enums são strings de valor (ex: "Aberto", "Administrador"), nunca índices.

// ===== Enums de domínio =====
export const Perfil = {
  ADMIN: 'Administrador',
  APOSTADOR: 'Apostador',
} as const
export type PerfilValor = (typeof Perfil)[keyof typeof Perfil]

// ===== Enums de domínio LanceBet =====
export const StatusEvento = {
  ABERTO: 'Aberto',
  FECHADO: 'Fechado',
  LIQUIDADO: 'Liquidado',
} as const
export type StatusEventoValor = (typeof StatusEvento)[keyof typeof StatusEvento]

export const StatusOpcao = {
  ATIVA: 'Ativa',
  SUSPENSA: 'Suspensa',
} as const
export type StatusOpcaoValor = (typeof StatusOpcao)[keyof typeof StatusOpcao]

export const StatusAposta = {
  ABERTA: 'Aberta',
  LIQUIDADA: 'Liquidada',
} as const
export type StatusApostaValor = (typeof StatusAposta)[keyof typeof StatusAposta]

export const ResultadoAposta = {
  PENDENTE: 'Pendente',
  GANHOU: 'Ganhou',
  PERDEU: 'Perdeu',
} as const
export type ResultadoApostaValor = (typeof ResultadoAposta)[keyof typeof ResultadoAposta]

export const TipoMovimentacao = {
  CREDITO_INICIAL: 'Credito Inicial',
  APOSTA: 'Aposta',
  GANHO: 'Ganho',
} as const
export type TipoMovimentacaoValor = (typeof TipoMovimentacao)[keyof typeof TipoMovimentacao]

export const StatusUsuario = {
  ATIVO: 'Ativo',
  BLOQUEADO: 'Bloqueado',
} as const
export type StatusUsuarioValor = (typeof StatusUsuario)[keyof typeof StatusUsuario]

export const StatusChamado = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em Análise',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
} as const
export type StatusChamadoValor = (typeof StatusChamado)[keyof typeof StatusChamado]

export const PrioridadeChamado = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
} as const
export type PrioridadeValor = (typeof PrioridadeChamado)[keyof typeof PrioridadeChamado]

export const StatusPagamento = {
  PENDENTE: 'Pendente',
  EM_PROCESSAMENTO: 'Em Processamento',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  CANCELADO: 'Cancelado',
  REEMBOLSADO: 'Reembolsado',
} as const
export type StatusPagamentoValor = (typeof StatusPagamento)[keyof typeof StatusPagamento]

export type TipoNotificacao = 'info' | 'sucesso' | 'aviso' | 'erro'
export type TipoInteracao = 'Abertura' | 'Resposta do Usuário' | 'Resposta do Administrador'

// ===== Comuns =====
export interface MensagemResponse {
  message: string
}
export interface TokenCsrfResponse {
  token: string
}
export interface PaginaResponse<T> {
  items: T[]
  pagina: number
  por_pagina: number
  total: number
  total_paginas: number
}

// ===== Usuário =====
// Espelha UsuarioComSaldoResponse do backend (GET /me, /login, /cadastrar).
export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: string
  cpf?: string | null
  data_nascimento: string
  status: string
  foto_url: string
  saldo_ficticio: number
  data_cadastro?: string | null
  data_atualizacao?: string | null
}
export interface DashboardData {
  chamados_pendentes?: number | null
  chamados_abertos?: number | null
}

// ===== Domínio LanceBet =====
export interface OpcaoAposta {
  id: number
  evento_id: number
  descricao: string
  sub: string
  odd: number
  status: string
  vencedora: boolean
}
export interface Evento {
  id: number
  mandante: string
  visitante: string
  titulo: string
  esporte: string
  competicao: string
  data_hora: string | null
  status: string
  resultado_descricao: string | null
  criado_por: number
  criado_em?: string | null
  opcoes: OpcaoAposta[]
}
export interface EventoAdmin extends Evento {
  total_apostas: number
  volume_apostado: number
}
export interface Aposta {
  id: number
  usuario_id: number
  opcao_aposta_id: number
  valor_apostado: number
  odd_registrada: number
  retorno_potencial: number
  status: string
  resultado: string
  criada_em?: string | null
  liquidada_em?: string | null
  titulo_evento: string
  descricao_opcao: string
  nome_usuario?: string | null
}
export interface ApostaComSaldo extends Aposta {
  saldo_apos: number
}
export interface Carteira {
  id: number
  usuario_id: number
  saldo_ficticio: number
  atualizado_em?: string | null
  total_apostado: number
  total_ganho: number
}
export interface MovimentacaoFinanceira {
  id: number
  carteira_id: number
  aposta_id?: number | null
  tipo: string
  valor: number
  saldo_apos: number
  descricao: string
  criado_em?: string | null
}
export interface AdminDashboard {
  eventos_ativos: number
  volume_apostado: number
  total_apostadores: number
  apostas_pendentes: number
  apostas_recentes: Aposta[]
}
export interface LiquidacaoResultado {
  evento: Evento
  apostas_liquidadas: number
  apostas_ganhadoras: number
  total_pago: number
}
export interface UsuarioAdmin {
  id: number
  nome: string
  email: string
  perfil: string
  cpf?: string | null
  data_nascimento: string
  status: string
  saldo_ficticio: number
  total_apostas: number
  data_cadastro?: string | null
}

// ===== Chamados =====
export interface ChamadoInteracao {
  id: number
  chamado_id: number
  usuario_id: number
  mensagem: string
  tipo: TipoInteracao
  data_interacao?: string | null
  status_resultante?: string | null
  data_leitura?: string | null
  usuario_nome?: string | null
  usuario_email?: string | null
}
export interface Chamado {
  id: number
  titulo: string
  status: string
  prioridade: string
  usuario_id: number
  data_abertura?: string | null
  data_fechamento?: string | null
  usuario_nome?: string | null
  usuario_email?: string | null
  mensagens_nao_lidas?: number
  tem_resposta_admin?: boolean
  interacoes?: ChamadoInteracao[] | null
}

// ===== Notificações =====
export interface Notificacao {
  id: number
  usuario_id: number
  titulo: string
  mensagem: string
  tipo: TipoNotificacao
  lida: boolean
  url_acao?: string | null
  data_criacao?: string | null
}
export interface NaoLidasResumo {
  total: number
  items: {
    id: number
    titulo: string
    mensagem: string
    tipo: TipoNotificacao
    url_acao?: string | null
    data_criacao?: string | null
  }[]
}

// ===== Pagamentos =====
export interface Pagamento {
  id: number
  usuario_id: number
  descricao: string
  valor: number
  status: string
  provider: string
  preference_id?: string | null
  payment_id?: string | null
  external_reference?: string | null
  url_checkout?: string | null
  data_criacao?: string | null
  data_atualizacao?: string | null
  usuario_nome?: string | null
}
export interface CriarPagamentoResultado {
  init_point: string
  pagamento_id: number
}
export interface DadosProvider {
  pagamento: Pagamento
  provider_nome: string
  dados_provider: Record<string, unknown> | null
}

// ===== Chat =====
export interface ChatSala {
  sala_id: string
}
export interface ChatMensagem {
  id: number
  sala_id: string
  usuario_id: number
  mensagem: string
  data_envio?: string | null
  lida_em?: string | null
}
export interface Conversa {
  sala_id: string
  outro_usuario: { id: number; nome: string; email: string; foto_url: string }
  ultima_mensagem?: {
    mensagem: string
    data_envio?: string | null
    usuario_id: number
  } | null
  nao_lidas: number
  ultima_atividade?: string | null
}
export interface UsuarioBusca {
  id: number
  nome: string
  email: string
  foto_url: string
}

// ===== Configurações / Auditoria / Backups =====
export interface ConfigItem {
  chave: string
  valor: string
  descricao?: string | null
  categoria: string
}
export interface ConfigCategoria {
  categoria: string
  itens: ConfigItem[]
}
export interface ConfigLista {
  total: number
  categorias: ConfigCategoria[]
}
export interface SalvarConfigResultado {
  atualizadas: number
  chaves_nao_encontradas: string[]
  message: string
}
export interface LogArquivo {
  data: string
  nivel: string
  total_linhas: number
  conteudo: string
  erro?: string | null
}
export interface AuditoriaRegistro {
  id: number
  usuario_id?: number | null
  usuario_nome?: string | null
  acao: string
  entidade: string
  entidade_id?: number | null
  dados_antes?: string | null
  dados_depois?: string | null
  ip?: string | null
  data?: string | null
}
export interface BackupInfo {
  nome_arquivo: string
  caminho_completo: string
  tipo: 'manual' | 'automatico'
  tamanho_bytes: number
  tamanho_formatado: string
  data_criacao: string
}
