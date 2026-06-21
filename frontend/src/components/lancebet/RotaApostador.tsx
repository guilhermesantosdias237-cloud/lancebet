// Gate de rota do apostador (espelha ProtectedRoute do protótipo, mas com as
// rotas do LanceBet: anônimo -> /entrar; perfil errado -> home do perfil).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Perfil } from '../../lib/types'

export default function RotaApostador() {
  const usuario = useAuthStore((s) => s.usuario)
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }
  if (usuario.perfil !== Perfil.APOSTADOR) {
    return <Navigate to="/admin" replace />
  }
  return <Outlet />
}
