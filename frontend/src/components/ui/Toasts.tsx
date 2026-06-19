import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useUIStore, type Toast } from '../../store/uiStore'
import Icon, { type IconName } from './Icon'

// Cores semânticas dos feedbacks (fundo sólido + texto branco), alinhadas à
// identidade P&B do LanceBet.
const CORES: Record<string, string> = {
  success: '#1a7f37',
  danger: '#cf222e',
  warning: '#b35900',
  info: '#1f2328',
}

const ICONES: Record<string, IconName> = {
  success: 'check-circle-fill',
  danger: 'exclamation-triangle-fill',
  warning: 'exclamation-circle-fill',
  info: 'info-circle-fill',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removerToast = useUIStore((s) => s.removerToast)
  useEffect(() => {
    const t = setTimeout(() => removerToast(toast.id), 5000)
    return () => clearTimeout(t)
  }, [toast.id, removerToast])

  const estilo: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: CORES[toast.tipo] ?? CORES.info,
    color: '#fff',
    padding: '12px 14px',
    marginBottom: 8,
    minWidth: 280,
    maxWidth: 380,
    boxShadow: '0 6px 20px rgba(0,0,0,.18)',
    fontSize: 14,
    fontWeight: 600,
    animation: 'lbfade .2s ease',
  }

  return (
    <div style={estilo} role="alert">
      <Icon name={ICONES[toast.tipo] ?? 'info-circle-fill'} size={18} />
      <span style={{ flex: 1 }}>{toast.mensagem}</span>
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => removerToast(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          opacity: 0.85,
          display: 'flex',
          padding: 2,
        }}
      >
        <Icon name="x-lg" size={14} />
      </button>
    </div>
  )
}

// Container de toasts (bottom-right). Renderizado uma vez no layout.
export default function Toasts() {
  const toasts = useUIStore((s) => s.toasts)
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1090,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
