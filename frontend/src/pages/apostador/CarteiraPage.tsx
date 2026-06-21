// Carteira + extrato (rota /carteira).
// Porte fiel de design/lancebet-react/src/pages/Wallet.jsx + GET /api/carteira e
// GET /api/carteira/extrato (paginado).
import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useAuthStore } from '../../store/authStore'
import { carteiraApi } from '../../lib/api'
import { fmt, formatarDataHora } from '../../lib/format'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

const head = { display: 'grid', gridTemplateColumns: '1.2fr 2.4fr 1fr 1fr', gap: 12 } as const

export default function CarteiraPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const [pagina, setPagina] = useState(1)

  const carteira = useFetch(() => carteiraApi.obter(), [])
  const extrato = useFetch(() => carteiraApi.extrato({ pagina, por_pagina: 12 }), [pagina])

  const saldo = usuario?.saldo_ficticio ?? carteira.data?.saldo_ficticio ?? 0
  const totalApostado = carteira.data?.total_apostado ?? 0
  const totalGanho = carteira.data?.total_ganho ?? 0
  const movs = extrato.data?.items ?? []

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 24px' }}>Carteira</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 34 }}>
        <div style={{ background: '#000', color: '#fff', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#B3B5B7' }}>SALDO FICTÍCIO</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 38, marginTop: 10 }}>{fmt(saldo)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7F7F7F' }}>Total apostado</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, marginTop: 10 }}>{fmt(totalApostado)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7F7F7F' }}>Total em ganhos</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, marginTop: 10 }}>{fmt(totalGanho)}</div>
        </div>
      </div>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26, margin: '0 0 16px' }}>Extrato de movimentações</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ ...head, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <div>Tipo</div><div>Descrição</div><div style={{ textAlign: 'right' }}>Valor</div><div style={{ textAlign: 'right' }}>Saldo após</div>
        </div>
        {extrato.carregando ? (
          <Spinner />
        ) : movs.length > 0 ? (
          movs.map((m) => (
            <div key={m.id} style={{ ...head, padding: '15px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
              <div><span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', border: '1px solid #DCDCDC', padding: '3px 7px', textTransform: 'uppercase' }}>{m.tipo}</span></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.descricao}</div>
                <div style={{ fontSize: 11.5, color: '#B3B5B7', fontWeight: 600, marginTop: 2 }}>{formatarDataHora(m.criado_em)}</div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: m.valor >= 0 ? '#000' : '#7F7F7F' }}>
                {(m.valor >= 0 ? '+ ' : '− ') + fmt(Math.abs(m.valor)).replace('- ', '')}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#7F7F7F' }}>{fmt(m.saldo_apos)}</div>
            </div>
          ))
        ) : (
          <div style={{ padding: 50, textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 14 }}>
            Nenhuma movimentação registrada.
          </div>
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        <Pagination pagina={pagina} totalPaginas={extrato.data?.total_paginas ?? 1} onPagina={setPagina} />
      </div>
    </main>
  )
}
