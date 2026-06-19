// Gate de rota para qualquer usuário autenticado (apostador OU administrador).
// Anônimo -> /entrar (guardando a origem). Usado por páginas comuns a todos os
// perfis, como /perfil (gerenciar dados e senha).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function RotaAutenticada() {
  const usuario = useAuthStore((s) => s.usuario)
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
