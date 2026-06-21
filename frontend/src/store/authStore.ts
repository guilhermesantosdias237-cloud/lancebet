import { create } from 'zustand'
import { authApi, ApiError, garantirCsrf, limparCsrf } from '../lib/api'
import type { Usuario } from '../lib/types'
import { Perfil } from '../lib/types'

interface AuthState {
  usuario: Usuario | null
  /** true até a verificação inicial de sessão terminar. */
  carregando: boolean
  isAdmin: () => boolean
  isApostador: () => boolean
  /** Verifica a sessão atual no backend (GET /api/me). Chamado no boot. */
  carregarSessao: () => Promise<void>
  /** Login dual: identificador pode ser e-mail OU CPF. */
  login: (identificador: string, senha: string) => Promise<Usuario>
  logout: () => Promise<void>
  /** Atualiza o usuário em memória (após editar perfil/foto/saldo). */
  setUsuario: (u: Usuario) => void
  /** Atualiza apenas o saldo fictício em memória (após apostar/ganhar). */
  setSaldo: (saldo: number) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  carregando: true,

  isAdmin: () => get().usuario?.perfil === Perfil.ADMIN,
  isApostador: () => get().usuario?.perfil === Perfil.APOSTADOR,

  carregarSessao: async () => {
    try {
      await garantirCsrf()
      const usuario = await authApi.me()
      set({ usuario, carregando: false })
    } catch (e) {
      // 401 anônimo é esperado no boot; qualquer falha => sem sessão.
      if (e instanceof ApiError && e.status === 401) {
        set({ usuario: null, carregando: false })
      } else {
        set({ usuario: null, carregando: false })
      }
    }
  },

  login: async (identificador, senha) => {
    const usuario = await authApi.login(identificador, senha)
    set({ usuario })
    return usuario
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      limparCsrf()
      set({ usuario: null })
    }
  },

  setUsuario: (usuario) => set({ usuario }),

  setSaldo: (saldo) =>
    set((s) => (s.usuario ? { usuario: { ...s.usuario, saldo_ficticio: saldo } } : s)),
}))
