// Primitivos de UI do LanceBet (portados de design/lancebet-react/src/components/ui.jsx).
// Estética inline preto/branco/cinza, hover via estado JS para manter paridade
// exata com o protótipo (sem depender de classes utilitárias).
import { useState } from 'react'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react'

type Variant =
  | 'primary'
  | 'light'
  | 'outline'
  | 'ghostDark'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  hoverStyle?: CSSProperties
}

const variants: Record<string, CSSProperties> = {
  primary: { background: '#000', color: '#fff' },
  primaryHover: { background: '#7F7F7F' },
  light: { background: '#fff', color: '#000' },
  lightHover: { background: '#B3B5B7' },
  outline: { background: 'transparent', color: '#000', border: '1.5px solid #000' },
  outlineHover: { background: '#F4F4F4' },
  ghostDark: { background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)' },
  ghostDarkHover: { borderColor: '#fff' },
}

/** Botão com suporte a hover via JS (mantém estética inline do design). */
export function Button({ variant = 'primary', style, hoverStyle, children, ...props }: ButtonProps) {
  const [hover, setHover] = useState(false)
  const base: CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    fontWeight: 800,
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    padding: '16px',
    fontSize: 14,
  }
  const v = variants[variant] || variants.primary
  const vh = variants[variant + 'Hover'] || {}
  return (
    <button
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...v, ...style, ...(hover ? { ...vh, ...hoverStyle } : {}) }}
    >
      {children}
    </button>
  )
}

interface BadgeProps {
  style?: CSSProperties
  children: ReactNode
}

export function Badge({ style, children }: BadgeProps) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '.06em',
        padding: '5px 10px',
        textTransform: 'uppercase',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

interface HoverCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverStyle?: CSSProperties
}

/** Card genérico cuja borda escurece no hover. */
export function HoverCard({
  style,
  hoverStyle = { borderColor: '#000' },
  children,
  ...props
}: HoverCardProps) {
  const [hover, setHover] = useState(false)
  return (
    <div
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transition: 'border-color .15s, transform .12s', ...style, ...(hover ? hoverStyle : {}) }}
    >
      {children}
    </div>
  )
}

// =====================================================================
// Estilos derivados de status (portados de format.js, mas chaveados pelos
// valores REAIS dos enums do backend: 'Aberto'/'Fechado'/'Liquidado', etc).
// =====================================================================
import { StatusEvento, StatusAposta, ResultadoAposta } from '../../lib/types'

export function statusEventoStyle(s: string): CSSProperties {
  if (s === StatusEvento.ABERTO) return { background: '#000', color: '#fff' }
  if (s === StatusEvento.FECHADO) return { background: '#fff', border: '1px solid #000', color: '#000' }
  return { background: '#B3B5B7', color: '#fff' }
}

export function statusEventoStyleDark(s: string): CSSProperties {
  if (s === StatusEvento.ABERTO) return { background: '#fff', color: '#000' }
  return { background: 'transparent', border: '1px solid rgba(255,255,255,.4)', color: '#fff' }
}

export function pickStyle(sel: boolean): CSSProperties {
  return sel
    ? { background: '#000', color: '#fff', border: '1.5px solid #000' }
    : { background: '#fff', color: '#000', border: '1.5px solid #DCDCDC' }
}

export function apostaBadgeLabel(b: { status: string; resultado: string }): string {
  if (b.status === StatusAposta.ABERTA) return 'EM ABERTO'
  return b.resultado === ResultadoAposta.GANHOU ? 'GANHOU' : 'PERDEU'
}

export function apostaBadgeStyle(b: { status: string; resultado: string }): CSSProperties {
  if (b.status === StatusAposta.ABERTA) return { background: '#F4F4F4', border: '1px solid #B3B5B7', color: '#000' }
  if (b.resultado === ResultadoAposta.GANHOU) return { background: '#000', color: '#fff' }
  return { background: '#fff', border: '1px solid #E4E4E4', color: '#B3B5B7' }
}

export function optionCardStyle(sel: boolean, sus: boolean): CSSProperties {
  if (sus) return { background: '#F4F4F4', border: '2px dashed #C8C8C8', color: '#B3B5B7' }
  if (sel) return { background: '#000', color: '#fff', border: '2px solid #000' }
  return { background: '#fff', border: '2px solid #E4E4E4' }
}

export function tabStyle(active: boolean): CSSProperties {
  return active ? { background: '#000', color: '#fff' } : { background: '#fff', color: '#7F7F7F' }
}

export function filterStyle(active: boolean): CSSProperties {
  return active
    ? { background: '#000', color: '#fff', border: '1.5px solid #000' }
    : { background: '#fff', color: '#000', border: '1.5px solid #DCDCDC' }
}
