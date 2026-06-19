import type { CSSProperties } from 'react'
import Icon from './Icon'

// Paginação em estilo P&B do LanceBet (sem Bootstrap).
function celulaStyle(opts: { ativo?: boolean; desabilitado?: boolean }): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: opts.ativo ? '#000' : '#fff',
    color: opts.ativo ? '#fff' : opts.desabilitado ? '#c8c8c8' : '#000',
    border: '1px solid #e4e4e4',
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: opts.desabilitado ? 'default' : 'pointer',
    minWidth: 38,
    justifyContent: 'center',
  }
}

export default function Pagination({
  pagina,
  totalPaginas,
  onPagina,
}: {
  pagina: number
  totalPaginas: number
  onPagina: (p: number) => void
}) {
  if (totalPaginas <= 1) return null

  const paginas: number[] = []
  const inicio = Math.max(1, pagina - 2)
  const fim = Math.min(totalPaginas, pagina + 2)
  for (let i = inicio; i <= fim; i++) paginas.push(i)

  const reticencias = (key: string) => (
    <span key={key} style={celulaStyle({ desabilitado: true })}>…</span>
  )

  return (
    <nav aria-label="Paginação" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          style={celulaStyle({ desabilitado: pagina <= 1 })}
          onClick={() => onPagina(pagina - 1)}
          disabled={pagina <= 1}
        >
          <Icon name="chevron-left" size={12} /> Anterior
        </button>
        {inicio > 1 && (
          <button style={celulaStyle({})} onClick={() => onPagina(1)}>1</button>
        )}
        {inicio > 2 && reticencias('ini')}
        {paginas.map((p) => (
          <button key={p} style={celulaStyle({ ativo: p === pagina })} onClick={() => onPagina(p)}>
            {p}
          </button>
        ))}
        {fim < totalPaginas - 1 && reticencias('fim')}
        {fim < totalPaginas && (
          <button style={celulaStyle({})} onClick={() => onPagina(totalPaginas)}>{totalPaginas}</button>
        )}
        <button
          style={celulaStyle({ desabilitado: pagina >= totalPaginas })}
          onClick={() => onPagina(pagina + 1)}
          disabled={pagina >= totalPaginas}
        >
          Próxima <Icon name="chevron-right" size={12} />
        </button>
      </div>
    </nav>
  )
}
