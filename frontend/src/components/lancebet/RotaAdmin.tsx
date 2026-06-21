// Gate de rota do administrador (espelha ProtectedRoute role=ADMINISTRADOR do
// protótipo: anônimo -> /entrar; apostador logado -> /painel).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Perfil } from '../../lib/types'

export default function RotaAdmin() {
  const usuario = useAuthStore((s) => s.usuario)
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }
  if (usuario.perfil !== Perfil.ADMIN) {
    return <Navigate to="/painel" replace />
  }
  return <Outlet />
}
