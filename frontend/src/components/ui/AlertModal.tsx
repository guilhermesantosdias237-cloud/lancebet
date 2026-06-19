import type { CSSProperties } from 'react'
import { useUIStore } from '../../store/uiStore'
import Icon, { type IconName } from './Icon'
import { backdropStyle, dialogStyle, headerCor, btnSecundario } from './modalStyles'

const ICONES: Record<string, IconName> = {
  danger: 'exclamation-triangle-fill',
  warning: 'exclamation-circle-fill',
  info: 'info-circle-fill',
  success: 'check-circle-fill',
}

// Modal de alerta global (feedback de aviso/erro/sucesso disparado pelo uiStore).
export default function AlertModal() {
  const alert = useUIStore((s) => s.alert)
  const fechar = useUIStore((s) => s.fecharAlerta)
  if (!alert) return null

  const tipo = alert.tipo ?? 'info'

  const tituloStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
  }

  return (
    <div style={backdropStyle} role="dialog" aria-modal="true">
      <div style={dialogStyle}>
        <div style={headerCor(tipo)}>
          <h5 style={tituloStyle}>
            <Icon name={ICONES[tipo] ?? 'info-circle-fill'} size={18} />
            {alert.titulo ?? 'Aviso'}
          </h5>
          <button
            type="button"
            aria-label="Fechar"
            onClick={fechar}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 2 }}
          >
            <Icon name="x-lg" size={16} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ margin: 0 }}>{alert.mensagem}</p>
          {alert.detalhes && (
            <p style={{ color: '#7f7f7f', fontSize: 13, marginTop: 8, marginBottom: 0 }}>{alert.detalhes}</p>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 20px' }}>
          <button type="button" style={btnSecundario} onClick={fechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
