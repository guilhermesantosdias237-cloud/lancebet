import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext.jsx';

// Protege rotas por perfil. role: 'APOSTADOR' | 'ADMINISTRADOR'.
export default function ProtectedRoute({ role, children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/entrar" replace />;
  if (role && currentUser.perfil !== role) {
    return <Navigate to={currentUser.perfil === 'ADMINISTRADOR' ? '/admin' : '/painel'} replace />;
  }
  return children;
}
