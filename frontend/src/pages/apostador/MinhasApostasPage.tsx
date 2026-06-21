// Minhas apostas (rota /minhas-apostas).
// Porte fiel de design/lancebet-react/src/pages/MyBets.jsx + GET /api/apostas/minhas
// com filtro de status (Aberta/Liquidada) e paginação.
import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { apostasApi } from '../../lib/api'
import { StatusAposta } from '../../lib/types'
import { fmt, ofmt, proto, formatarDataHora } from '../../lib/format'
import { Badge, filterStyle, apostaBadgeLabel, apostaBadgeStyle } from '../../components/lancebet/ui'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import iconBlack from '../../assets/icon_black.svg'

const filtros: [string, string][] = [
  ['', 'Todas'],
  [StatusAposta.ABERTA, 'Em aberto'],
  [StatusAposta.LIQUIDADA, 'Liquidadas'],
]

const cell = { fontSize: 10, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.06em' } as const

export default function MinhasApostasPage() {
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(1)

  const { data, carregando } = useFetch(
    () => apostasApi.minhas({ status: filtro || undefined, pagina, por_pagina: 10 }),
    [filtro, pagina],
  )

  const list = data?.items ?? []

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 22px' }}>Minhas apostas</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {filtros.map(([key, lbl]) => (
          <button
            key={key || 'todas'}
            onClick={() => {
              setFiltro(key)
              setPagina(1)
            }}
            style={{ padding: '10px 18px', fontWeight: 800, fontSize: 12, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', ...filterStyle(filtro === key) }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {carregando ? (
        <Spinner />
      ) : list.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((b) => (
              <div key={b.id} style={{ background: '#fff', border: '1px solid #E4E4E4', borderLeft: '4px solid #000', padding: '18px 22px', display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1.2fr 1.1fr', gap: 14, alignItems: 'center' }}>
                <div>
                  <div style={cell}>{proto(b.id)}</div>
                  <div style={{ fontWeight: 900, fontSize: 16, marginTop: 2 }}>{b.titulo_evento}</div>
                  <div style={{ fontSize: 12.5, color: '#7F7F7F', fontWeight: 600, marginTop: 2 }}>Palpite: {b.descricao_opcao} · {formatarDataHora(b.criada_em)}</div>
                </div>
                <div><div style={cell}>VALOR</div><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(b.valor_apostado)}</div></div>
                <div><div style={cell}>ODD</div><div style={{ fontWeight: 800, fontSize: 15 }}>{ofmt(b.odd_registrada)}</div></div>
                <div><div style={cell}>RETORNO POT.</div><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(b.retorno_potencial)}</div></div>
                <div style={{ textAlign: 'right' }}><Badge style={{ padding: '6px 12px', ...apostaBadgeStyle(b) }}>{apostaBadgeLabel(b)}</Badge></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Pagination pagina={pagina} totalPaginas={data?.total_paginas ?? 1} onPagina={setPagina} />
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 60, textAlign: 'center', color: '#7F7F7F' }}>
          <img src={iconBlack} alt="" style={{ height: 54, opacity: 0.12, marginBottom: 14 }} />
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Nenhuma aposta nesta categoria.</p>
        </div>
      )}
    </main>
  )
}
