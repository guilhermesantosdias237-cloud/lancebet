// Schemas Zod reutilizáveis para validação de formulários.
import { z } from 'zod'
import { Perfil } from './types'

/** Regras de senha forte (espelham validar_senha_forte do backend). Uso interno/admin. */
export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos 1 número')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'A senha deve conter ao menos um caractere especial.')

/** Senha simples para cadastro de apostador (espelha validar_senha_simples do backend). */
export const senhaSimplesSchema = z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')

export const emailSchema = z.string().min(1, 'Informe o e-mail').email('E-mail inválido')

// ===== Auth LanceBet =====

/** Login dual: identificador pode ser e-mail OU CPF. */
export const loginSchema = z.object({
  identificador: z.string().min(1, 'Informe o e-mail ou CPF'),
  senha: z.string().min(1, 'Informe a senha'),
})
export type LoginLanceBetForm = z.infer<typeof loginSchema>
// Compat com nomeação antiga (algumas páginas legadas importam LoginForm).
export type LoginForm = LoginLanceBetForm

const nomeCompletoSchema = z
  .string()
  .min(4, 'O nome deve ter no mínimo 4 caracteres')
  .max(128, 'O nome deve ter no máximo 128 caracteres')
  .refine((v) => v.trim().split(/\s+/).filter(Boolean).length >= 2, 'Informe nome e sobrenome.')

/** Calcula idade completa a partir de uma data ISO YYYY-MM-DD. */
function idadeEm(dataIso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso)
  if (!m) return null
  const nasc = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(nasc.getTime())) return null
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const mes = hoje.getMonth() - nasc.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

/** Cadastro de apostador: senha simples (min 6) + maioridade (>=18). */
export const cadastroApostadorSchema = z.object({
  nome: nomeCompletoSchema,
  email: emailSchema,
  cpf: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, '').length === 11,
      'CPF deve ter 11 dígitos.',
    ),
  data_nascimento: z
    .string()
    .min(1, 'Informe a data de nascimento')
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'Data inválida.')
    .refine((v) => {
      const idade = idadeEm(v)
      return idade !== null && idade >= 18
    }, 'Cadastro permitido apenas para maiores de 18 anos.'),
  senha: senhaSimplesSchema,
  aceite_termos: z
    .boolean()
    .refine((v) => v === true, 'É preciso aceitar os termos e a política de privacidade.'),
})
export type CadastroApostadorForm = z.infer<typeof cadastroApostadorSchema>

export const esqueciSenhaSchema = z.object({
  identificador: z.string().min(1, 'Informe seu e-mail ou CPF'),
})
export type EsqueciSenhaForm = z.infer<typeof esqueciSenhaSchema>

export const redefinirSenhaSchema = z
  .object({
    senha: senhaSimplesSchema,
    confirmar_senha: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.senha === d.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })
export type RedefinirSenhaForm = z.infer<typeof redefinirSenhaSchema>

// ===== Apostas =====

export const criarApostaSchema = z.object({
  opcao_aposta_id: z.number().int().positive('Selecione uma opção.'),
  valor_apostado: z.number().positive('Informe um valor para apostar.'),
})
export type CriarApostaForm = z.infer<typeof criarApostaSchema>

// ===== Admin: eventos / opções / liquidação =====

const oddSchema = z
  .number({ message: 'Informe a odd.' })
  .gt(1, 'A odd deve ser maior que 1,00.')

export const criarEventoSchema = z.object({
  mandante: z.string().min(1, 'Informe o mandante'),
  visitante: z.string().min(1, 'Informe o visitante'),
  competicao: z.string().min(1, 'Informe a competição').default('Brasileirão Série A'),
  data_hora: z.string().min(1, 'Informe a data/hora'),
  odd_mandante: oddSchema,
  odd_empate: oddSchema,
  odd_visitante: oddSchema,
})
export type CriarEventoForm = z.infer<typeof criarEventoSchema>

export const adicionarOpcaoSchema = z.object({
  descricao: z.string().min(1, 'Informe a descrição'),
  sub: z.string().default('Mercado'),
  odd: oddSchema,
})
export type AdicionarOpcaoForm = z.infer<typeof adicionarOpcaoSchema>

export const atualizarOddSchema = z.object({
  odd: oddSchema,
})
export type AtualizarOddForm = z.infer<typeof atualizarOddSchema>

export const liquidarEventoSchema = z.object({
  opcao_vencedora_id: z.number().int().positive('Selecione a opção vencedora.'),
  resultado_descricao: z.string().optional().default(''),
})
export type LiquidarEventoForm = z.infer<typeof liquidarEventoSchema>

// ===== Admin: usuários (CRUD legado do starter — mantido para páginas legadas) =====

const nomeUsuarioSchema = z
  .string()
  .min(4, 'O nome deve ter no mínimo 4 caracteres')
  .max(100, 'O nome deve ter no máximo 100 caracteres')
  .refine((v) => v.trim().split(/\s+/).filter(Boolean).length >= 2, 'Informe nome e sobrenome.')

const perfilAdminSchema = z.enum([Perfil.ADMIN, Perfil.APOSTADOR], {
  message: 'Selecione um perfil',
})

export const adminUsuarioCadastroSchema = z.object({
  nome: nomeUsuarioSchema,
  email: emailSchema,
  senha: senhaSchema,
  perfil: perfilAdminSchema,
})
export type AdminUsuarioCadastroForm = z.infer<typeof adminUsuarioCadastroSchema>

export const adminUsuarioEdicaoSchema = z.object({
  nome: nomeUsuarioSchema,
  email: emailSchema,
  perfil: perfilAdminSchema,
})
export type AdminUsuarioEdicaoForm = z.infer<typeof adminUsuarioEdicaoSchema>
