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

// ===== Comuns =====
export interface MensagemResponse {
  message: string
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
