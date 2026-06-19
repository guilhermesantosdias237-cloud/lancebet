import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useUIStore } from '../../store/uiStore'
import Icon, { type IconName } from './Icon'
import { backdropStyle, dialogStyle, headerCor, btnSecundario, btnPrimario } from './modalStyles'

// Modal de confirmação global. Disparado por
// useUIStore().pedirConfirmacao({ mensagem, onConfirmar, ... }).
export default function ConfirmModal() {
  const confirm = useUIStore((s) => s.confirm)
  const fechar = useUIStore((s) => s.fecharConfirmacao)
  const [processando, setProcessando] = useState(false)

  if (!confirm) return null

  const tipo = confirm.tipo ?? 'danger'
  const icone: IconName = tipo === 'danger' ? 'exclamation-triangle-fill' : 'exclamation-circle-fill'

  async function confirmar() {
    try {
      setProcessando(true)
      await confirm!.onConfirmar()
      fechar()
    } finally {
      setProcessando(false)
    }
  }

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
            <Icon name={icone} size={18} />
            {confirm.titulo ?? 'Confirmar ação'}
          </h5>
          <button
            type="button"
            aria-label="Fechar"
            onClick={fechar}
            disabled={processando}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 2 }}
          >
            <Icon name="x-lg" size={16} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ margin: 0 }}>{confirm.mensagem}</p>
          {confirm.detalhes && (
            <p style={{ color: '#7f7f7f', fontSize: 13, marginTop: 8, marginBottom: 0 }}>{confirm.detalhes}</p>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 20px 20px' }}>
          <button type="button" style={btnSecundario} onClick={fechar} disabled={processando}>
            {confirm.textoCancelar ?? 'Cancelar'}
          </button>
          <button
            type="button"
            style={btnPrimario(tipo)}
            onClick={confirmar}
            disabled={processando}
          >
            {processando ? 'Processando…' : confirm.textoConfirmar ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
