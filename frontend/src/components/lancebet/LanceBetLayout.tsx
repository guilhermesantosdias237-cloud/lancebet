// Layout único do LanceBet (espelha o <Layout> de design/lancebet-react/src/App.jsx).
// Header sticky + conteúdo animado (lbfade) + feedback global do uiStore.
// O Footer NÃO entra aqui: no protótipo cada página decide se o renderiza.
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Toasts from '../ui/Toasts'
import ConfirmModal from '../ui/ConfirmModal'
import AlertModal from '../ui/AlertModal'

export default function LanceBetLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F4' }}>
      <Header />
      <div style={{ animation: 'lbfade .35s ease' }}>
        <Outlet />
      </div>
      <Toasts />
      <ConfirmModal />
      <AlertModal />
    </div>
  )
}
