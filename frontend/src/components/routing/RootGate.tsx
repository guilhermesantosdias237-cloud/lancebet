import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { spinnerRing } from '../ui/Spinner'

// Componente raiz: verifica a sessão (GET /api/me) uma vez no boot e
// segura a renderização até saber se há usuário logado.
export default function RootGate() {
  const carregando = useAuthStore((s) => s.carregando)
  const carregarSessao = useAuthStore((s) => s.carregarSessao)

  useEffect(() => {
    carregarSessao()
  }, [carregarSessao])

  if (carregando) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={spinnerRing} role="status" aria-label="Carregando..." />
      </div>
    )
  }

  return <Outlet />
}
