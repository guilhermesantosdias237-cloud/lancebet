import type { CSSProperties } from 'react'

// Anel de carregamento (CSS puro, sem Bootstrap). Usa o keyframe `lbspin`
// definido em index.css.
export const spinnerRing: CSSProperties = {
  width: 36,
  height: 36,
  border: '3px solid #e4e4e4',
  borderTopColor: '#000',
  borderRadius: '50%',
  animation: 'lbspin .7s linear infinite',
}

// Indicador de carregamento centralizado.
export default function Spinner({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ ...spinnerRing, margin: '0 auto' }} role="status" aria-label={texto} />
      {texto && <p style={{ color: '#7f7f7f', marginTop: 12, marginBottom: 0 }}>{texto}</p>}
    </div>
  )
}
