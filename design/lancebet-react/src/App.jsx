import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router';
import Header from './components/Header.jsx';
import Toast from './components/Toast.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Recover from './pages/Recover.jsx';
import Rules from './pages/Rules.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Confirm from './pages/Confirm.jsx';
import MyBets from './pages/MyBets.jsx';
import Wallet from './pages/Wallet.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminOdds from './pages/admin/AdminOdds.jsx';
import AdminResult from './pages/admin/AdminResult.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F4' }}>
      <Header />
      <div style={{ animation: 'lbfade .35s ease' }}>
        <Outlet />
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  const apostador = (el) => <ProtectedRoute role="APOSTADOR">{el}</ProtectedRoute>;
  const admin = (el) => <ProtectedRoute role="ADMINISTRADOR">{el}</ProtectedRoute>;

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Pública */}
          <Route path="/" element={<Home />} />
          <Route path="/entrar" element={<Auth tab="login" />} />
          <Route path="/cadastro" element={<Auth tab="cadastro" />} />
          <Route path="/recuperar-senha" element={<Recover />} />
          <Route path="/regras" element={<Rules />} />

          {/* Apostador */}
          <Route path="/painel" element={apostador(<Dashboard />)} />
          <Route path="/eventos" element={apostador(<Events />)} />
          <Route path="/eventos/:id" element={apostador(<EventDetail />)} />
          <Route path="/aposta-confirmada" element={apostador(<Confirm />)} />
          <Route path="/minhas-apostas" element={apostador(<MyBets />)} />
          <Route path="/carteira" element={apostador(<Wallet />)} />

          {/* Admin */}
          <Route path="/admin" element={admin(<AdminDashboard />)} />
          <Route path="/admin/eventos" element={admin(<AdminEvents />)} />
          <Route path="/admin/odds" element={admin(<AdminOdds />)} />
          <Route path="/admin/odds/:id" element={admin(<AdminOdds />)} />
          <Route path="/admin/resultados" element={admin(<AdminResult />)} />
          <Route path="/admin/usuarios" element={admin(<AdminUsers />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
