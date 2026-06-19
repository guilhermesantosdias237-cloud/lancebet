import type { CSSProperties } from 'react'

// Estilos compartilhados pelos modais globais (ConfirmModal/AlertModal),
// inline para não depender do Bootstrap. Paleta semântica + P&B do LanceBet.
const CORES: Record<string, string> = {
  success: '#1a7f37',
  danger: '#cf222e',
  warning: '#b35900',
  info: '#1f2328',
}

export const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1080,
  padding: 16,
}

export const dialogStyle: CSSProperties = {
  background: '#fff',
  width: '100%',
  maxWidth: 460,
  boxShadow: '0 12px 40px rgba(0,0,0,.3)',
  animation: 'lbfade .2s ease',
}

export function headerCor(tipo: string): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    background: CORES[tipo] ?? CORES.info,
    color: '#fff',
    padding: '14px 20px',
  }
}

export const btnSecundario: CSSProperties = {
  background: 'transparent',
  color: '#000',
  border: '1.5px solid #000',
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  padding: '10px 18px',
}

export function btnPrimario(tipo: string): CSSProperties {
  return {
    background: CORES[tipo] ?? '#000',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    padding: '10px 18px',
  }
}
