import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock do cliente de API usado pelo authStore (funções de domínio authApi).
vi.mock('../lib/api', () => {
  class ApiError extends Error {
    status: number
    constructor(status: number, msg: string) {
      super(msg)
      this.status = status
    }
  }
  return {
    authApi: { me: vi.fn(), login: vi.fn(), logout: vi.fn() },
    ApiError,
    garantirCsrf: vi.fn().mockResolvedValue('tok'),
    limparCsrf: vi.fn(),
  }
})

import { useAuthStore } from './authStore'
import { authApi, ApiError, limparCsrf } from '../lib/api'

const admin = {
  id: 1,
  nome: 'Admin',
  email: 'a@x.com',
  perfil: 'Administrador',
  cpf: null,
  data_nascimento: '1988-01-01',
  status: 'Ativo',
  foto_url: '',
  saldo_ficticio: 0,
  data_cadastro: '',
}
const apostador = { ...admin, id: 2, perfil: 'Apostador', saldo_ficticio: 1000 }

const mMe = authApi.me as unknown as ReturnType<typeof vi.fn>
const mLogin = authApi.login as unknown as ReturnType<typeof vi.fn>
const mLogout = authApi.logout as unknown as ReturnType<typeof vi.fn>

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ usuario: null, carregando: true })
  })

  it('login (identificador) define o usuário e retorna o objeto', async () => {
    mLogin.mockResolvedValueOnce(admin)
    const u = await useAuthStore.getState().login('a@x.com', 'senha')
    expect(u).toEqual(admin)
    expect(useAuthStore.getState().usuario).toEqual(admin)
    expect(mLogin).toHaveBeenCalledWith('a@x.com', 'senha')
  })

  it('isAdmin / isApostador refletem o perfil', () => {
    useAuthStore.setState({ usuario: admin })
    expect(useAuthStore.getState().isAdmin()).toBe(true)
    expect(useAuthStore.getState().isApostador()).toBe(false)
    useAuthStore.setState({ usuario: apostador })
    expect(useAuthStore.getState().isAdmin()).toBe(false)
    expect(useAuthStore.getState().isApostador()).toBe(true)
    useAuthStore.setState({ usuario: null })
    expect(useAuthStore.getState().isAdmin()).toBe(false)
  })

  it('setSaldo atualiza apenas o saldo fictício', () => {
    useAuthStore.setState({ usuario: apostador })
    useAuthStore.getState().setSaldo(750)
    expect(useAuthStore.getState().usuario?.saldo_ficticio).toBe(750)
  })

  it('logout limpa usuário e o token CSRF', async () => {
    useAuthStore.setState({ usuario: admin })
    mLogout.mockResolvedValueOnce({ message: 'ok' })
    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().usuario).toBeNull()
    expect(limparCsrf).toHaveBeenCalled()
  })

  it('carregarSessao define usuário quando /me responde', async () => {
    mMe.mockResolvedValueOnce(admin)
    await useAuthStore.getState().carregarSessao()
    const s = useAuthStore.getState()
    expect(s.usuario).toEqual(admin)
    expect(s.carregando).toBe(false)
  })

  it('carregarSessao deixa usuário nulo em 401', async () => {
    mMe.mockRejectedValueOnce(new ApiError(401, 'Não autorizado'))
    await useAuthStore.getState().carregarSessao()
    const s = useAuthStore.getState()
    expect(s.usuario).toBeNull()
    expect(s.carregando).toBe(false)
  })
})
