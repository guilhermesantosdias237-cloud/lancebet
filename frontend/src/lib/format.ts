// Formatadores de exibição (datas e moeda) no padrão brasileiro.

const TZ = 'America/Sao_Paulo'

/** ISO 8601 -> "dd/mm/aaaa". */
export function formatarData(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR', { timeZone: TZ })
}

/** ISO 8601 -> "dd/mm/aaaa HH:MM". */
export function formatarDataHora(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** ISO 8601 -> "HH:MM". */
export function formatarHora(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('pt-BR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Número -> "R$ 1.234,56". */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Bytes -> "1,2 MB". */
export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

// =====================================================================
// Helpers de exibição do LanceBet (portados de design/lancebet-react/src/lib/format.js).
// =====================================================================

/** Número -> "R$ 1.234,56" (com sinal negativo "- R$ ..." para débitos). */
export function fmt(v: number): string {
  const n = Number(v) || 0
  const neg = n < 0
  const f = Math.abs(n).toFixed(2)
  const p = f.split('.')
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return (neg ? '- ' : '') + 'R$ ' + p[0] + ',' + p[1]
}

/** Odd -> "1,85". */
export function ofmt(o: number): string {
  return Number(o).toFixed(2).replace('.', ',')
}

/** Protocolo de aposta -> "LB-000042". */
export const proto = (id: number): string => 'LB-' + String(id).padStart(6, '0')
