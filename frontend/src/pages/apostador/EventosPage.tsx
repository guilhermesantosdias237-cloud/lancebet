// Lista de eventos do apostador (rota /eventos).
// Porte fiel de design/lancebet-react/src/pages/Events.jsx + filtro de status.
// GET /api/eventos retorna apenas não-LIQUIDADOS (Aberto + Fechado).
import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { eventosApi } from '../../lib/api'
import { StatusEvento } from '../../lib/types'
import EventCard from '../../components/lancebet/EventCard'
import { filterStyle } from '../../components/lancebet/ui'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

const filtros: [string, string][] = [
  ['', 'Todos'],
  [StatusEvento.ABERTO, 'Abertos'],
  [StatusEvento.FECHADO, 'Fechados'],
]

export default function EventosPage() {
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(1)

  const { data, carregando, erro } = useFetch(
    () => eventosApi.listar({ status: filtro || undefined, pagina, por_pagina: 12 }),
    [filtro, pagina],
  )

  const list = (data?.items ?? []).filter((e) => e.status !== StatusEvento.LIQUIDADO)

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', textTransform: 'uppercase' }}>Brasileirão Série A · 2026</div>
        <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '8px 0 0' }}>Eventos disponíveis</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {filtros.map(([key, lbl]) => (
          <button
            key={key || 'todos'}
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
      ) : erro ? (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 50, textAlign: 'center', color: '#7F7F7F', fontWeight: 600 }}>
          Não foi possível carregar os eventos.
        </div>
      ) : list.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {list.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Pagination pagina={pagina} totalPaginas={data?.total_paginas ?? 1} onPagina={setPagina} />
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 60, textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 14 }}>
          Nenhum evento disponível nesta categoria.
        </div>
      )}
    </main>
  )
}
