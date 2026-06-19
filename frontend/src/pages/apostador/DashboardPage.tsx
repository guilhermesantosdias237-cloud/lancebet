// Painel do apostador (rota /painel).
// Porte fiel de design/lancebet-react/src/pages/Dashboard.jsx, trocando o
// AppContext mock por: saldo do authStore + GET /api/carteira + /api/eventos + /api/apostas/minhas.
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useAuthStore } from '../../store/authStore'
import { carteiraApi, eventosApi, apostasApi } from '../../lib/api'
import { StatusEvento } from '../../lib/types'
import { fmt, ofmt } from '../../lib/format'
import EventCard from '../../components/lancebet/EventCard'
import { Button, Badge, apostaBadgeLabel, apostaBadgeStyle } from '../../components/lancebet/ui'
import Spinner from '../../components/ui/Spinner'

const cell = { fontSize: 10, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.06em' } as const

export default function DashboardApostadorPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)

  const carteira = useFetch(() => carteiraApi.obter(), [])
  const eventos = useFetch(
    () => eventosApi.listar({ status: StatusEvento.ABERTO, por_pagina: 3 }),
    [],
  )
  const apostas = useFetch(() => apostasApi.minhas({ por_pagina: 3 }), [])

  const saldo = usuario?.saldo_ficticio ?? carteira.data?.saldo_ficticio ?? 0
  const totalApostado = carteira.data?.total_apostado ?? 0
  const totalGanho = carteira.data?.total_ganho ?? 0
  const featured = eventos.data?.items ?? []
  const lastBets = apostas.data?.items ?? []

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: 18, marginBottom: 34 }}>
        <div style={{ background: '#000', color: '#fff', padding: '30px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#B3B5B7' }}>SALDO FICTÍCIO DISPONÍVEL</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 50, lineHeight: 1, margin: '14px 0 22px' }}>{fmt(saldo)}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="light" onClick={() => navigate('/eventos')} style={{ padding: '13px 20px', fontSize: 13 }}>Apostar agora</Button>
            <Button variant="ghostDark" onClick={() => navigate('/carteira')} style={{ padding: '13px 20px', fontSize: 13 }}>Extrato</Button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7F7F7F' }}>Total apostado</div>
            <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 36, marginTop: 10 }}>{fmt(totalApostado)}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7F7F7F' }}>Total em ganhos</div>
            <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 36, marginTop: 10 }}>{fmt(totalGanho)}</div>
          </div>
          <div style={{ background: '#F4F4F4', border: '1px dashed #C8C8C8', padding: '18px 24px', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: '#000', background: '#fff', border: '1px solid #DCDCDC', padding: '4px 9px' }}>SIMULADO</span>
            <span style={{ fontSize: 13, color: '#7F7F7F', fontWeight: 500 }}>Depósitos e saques estão fora do MVP. Todo o saldo é fictício e serve apenas para demonstração.</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: 0 }}>Jogos abertos</h2>
        <button onClick={() => navigate('/eventos')} style={{ background: 'transparent', border: 'none', color: '#000', fontWeight: 700, fontSize: 12.5, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: '2px solid #000', paddingBottom: 2 }}>Ver todos →</button>
      </div>
      {eventos.carregando ? (
        <Spinner />
      ) : featured.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 38 }}>
          {featured.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 50, textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 14, marginBottom: 38 }}>
          Nenhum jogo aberto no momento.
        </div>
      )}

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 18px' }}>Últimas apostas</h2>
      {apostas.carregando ? (
        <Spinner />
      ) : lastBets.length > 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          {lastBets.map((b) => (
            <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1.1fr', gap: 12, alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{b.titulo_evento}</div>
                <div style={{ fontSize: 12, color: '#7F7F7F', fontWeight: 600, marginTop: 2 }}>Palpite: {b.descricao_opcao}</div>
              </div>
              <div><div style={cell}>VALOR</div><div style={{ fontWeight: 800, fontSize: 14 }}>{fmt(b.valor_apostado)}</div></div>
              <div><div style={cell}>ODD</div><div style={{ fontWeight: 800, fontSize: 14 }}>{ofmt(b.odd_registrada)}</div></div>
              <div><div style={cell}>RETORNO</div><div style={{ fontWeight: 800, fontSize: 14 }}>{fmt(b.retorno_potencial)}</div></div>
              <div style={{ textAlign: 'right' }}><Badge style={{ fontSize: 10, padding: '5px 10px', ...apostaBadgeStyle(b) }}>{apostaBadgeLabel(b)}</Badge></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 50, textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 14 }}>
          Você ainda não fez apostas. Escolha um jogo e comece agora.
        </div>
      )}
    </main>
  )
}
