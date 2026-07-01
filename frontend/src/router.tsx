import { createBrowserRouter, Navigate } from 'react-router-dom'

import RootGate from './components/routing/RootGate'
import RouteError from './components/routing/RouteError'
import LanceBetLayout from './components/lancebet/LanceBetLayout'
import RotaApostador from './components/lancebet/RotaApostador'
import RotaAdmin from './components/lancebet/RotaAdmin'
import RotaAutenticada from './components/lancebet/RotaAutenticada'

// ===== Públicas =====
import HomePage from './pages/public/HomePage'
import RegrasPage from './pages/public/RegrasPage'
import LoginPage from './pages/auth/LoginPage'
import CadastroPage from './pages/auth/CadastroPage'
import RecuperarSenhaPage from './pages/auth/RecuperarSenhaPage'

// ===== Apostador =====
import DashboardApostadorPage from './pages/apostador/DashboardPage'
import EventosPage from './pages/apostador/EventosPage'
import EventoDetalhePage from './pages/apostador/EventoDetalhePage'
import ApostaConfirmadaPage from './pages/apostador/ApostaConfirmadaPage'
import MinhasApostasPage from './pages/apostador/MinhasApostasPage'
import CarteiraPage from './pages/apostador/CarteiraPage'

// ===== Admin =====
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminEventosPage from './pages/admin/AdminEventosPage'
import AdminOddsPage from './pages/admin/AdminOddsPage'
import AdminTimesPage from './pages/admin/AdminTimesPage'
import AdminResultadoPage from './pages/admin/AdminResultadoPage'
import AdminUsuariosPage from './pages/admin/AdminUsuariosPage'

// ===== Comum (qualquer perfil autenticado) =====
import PerfilPage from './pages/usuario/PerfilPage'

// O roteador segue exatamente as rotas de design/lancebet-react/src/App.jsx.
// Toda a árvore vive sob RootGate (carrega a sessão via /api/me uma vez) e
// LanceBetLayout (Header sticky + conteúdo animado + toasts/modais do uiStore).
// As páginas legadas do starter (chamados, pagamentos, chat, notificações,
// exemplos, admin core) permanecem no código-fonte para referência acadêmica,
// mas não são roteadas no MVP do LanceBet.
export const router = createBrowserRouter([
  {
    element: <RootGate />,
    errorElement: <RouteError />,
    children: [
      {
        element: <LanceBetLayout />,
        children: [
          // ===== Público =====
          { path: '/', element: <HomePage /> },
          { path: '/entrar', element: <LoginPage /> },
          { path: '/cadastro', element: <CadastroPage /> },
          { path: '/recuperar-senha', element: <RecuperarSenhaPage /> },
          { path: '/regras', element: <RegrasPage /> },

          // ===== Comum (qualquer usuário autenticado) =====
          {
            element: <RotaAutenticada />,
            children: [
              { path: '/perfil', element: <PerfilPage /> },
            ],
          },

          // ===== Apostador =====
          {
            element: <RotaApostador />,
            children: [
              { path: '/painel', element: <DashboardApostadorPage /> },
              { path: '/eventos', element: <EventosPage /> },
              { path: '/eventos/:id', element: <EventoDetalhePage /> },
              { path: '/aposta-confirmada', element: <ApostaConfirmadaPage /> },
              { path: '/minhas-apostas', element: <MinhasApostasPage /> },
              { path: '/carteira', element: <CarteiraPage /> },
            ],
          },

          // ===== Administrador =====
          {
            element: <RotaAdmin />,
            children: [
              { path: '/admin', element: <AdminDashboardPage /> },
              { path: '/admin/eventos', element: <AdminEventosPage /> },
              { path: '/admin/times', element: <AdminTimesPage /> },
              { path: '/admin/odds', element: <AdminOddsPage /> },
              { path: '/admin/odds/:id', element: <AdminOddsPage /> },
              { path: '/admin/resultados', element: <AdminResultadoPage /> },
              { path: '/admin/usuarios', element: <AdminUsuariosPage /> },
            ],
          },

          // ===== Fallback: redireciona para a home =====
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])
