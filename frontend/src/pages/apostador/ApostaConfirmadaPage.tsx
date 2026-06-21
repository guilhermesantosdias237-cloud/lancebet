// Confirmação de aposta (rota /aposta-confirmada).
// Porte fiel de design/lancebet-react/src/pages/Confirm.jsx. Lê o ApostaComSaldo
// do location.state (definido pela EventoDetalhePage); sem dados, volta para /eventos.
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import type { ApostaComSaldo } from '../../lib/types'
import { fmt, ofmt, proto, formatarDataHora } from '../../lib/format'
import { Button } from '../../components/lancebet/ui'
import iconWhite from '../../assets/icon_white.svg'

const row: CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F0F0F0' }
const label: CSSProperties = { color: '#7F7F7F', fontWeight: 600, fontSize: 14 }
const val: CSSProperties = { fontWeight: 800, fontSize: 14 }

export default function ApostaConfirmadaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const aposta = (location.state as { aposta?: ApostaComSaldo } | null)?.aposta

  if (!aposta) return <Navigate to="/eventos" replace />

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '54px 28px 64px' }}>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ background: '#000', color: '#fff', padding: 36, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <img src={iconWhite} alt="" style={{ position: 'absolute', right: -30, bottom: -40, height: 180, opacity: 0.07 }} />
          <div style={{ width: 54, height: 54, border: '3px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26, fontWeight: 900 }}>✓</div>
          <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 30, margin: 0 }}>Aposta confirmada!</h1>
          <div style={{ fontSize: 13, color: '#B3B5B7', fontWeight: 600, letterSpacing: '.06em', marginTop: 8 }}>PROTOCOLO {proto(aposta.id)}</div>
        </div>
        <div style={{ padding: '30px 34px' }}>
          <div style={row}><span style={label}>Evento</span><span style={val}>{aposta.titulo_evento}</span></div>
          <div style={row}><span style={label}>Palpite</span><span style={val}>{aposta.descricao_opcao}</span></div>
          <div style={row}><span style={label}>Data / hora</span><span style={val}>{formatarDataHora(aposta.criada_em)}</span></div>
          <div style={row}><span style={label}>Valor apostado</span><span style={val}>{fmt(aposta.valor_apostado)}</span></div>
          <div style={row}><span style={label}>Odd registrada</span><span style={val}>{ofmt(aposta.odd_registrada)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0 6px' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Retorno potencial</span>
            <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26 }}>{fmt(aposta.retorno_potencial)}</span>
          </div>
          <div style={{ background: '#F4F4F4', padding: '13px 16px', fontSize: 13, color: '#7F7F7F', fontWeight: 600, margin: '18px 0 24px' }}>
            Novo saldo fictício: <strong style={{ color: '#000' }}>{fmt(aposta.saldo_apos)}</strong>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => navigate('/minhas-apostas')} style={{ flex: 1, padding: 15, fontSize: 13 }}>Minhas apostas</Button>
            <Button variant="outline" onClick={() => navigate('/eventos')} style={{ flex: 1, padding: 15, fontSize: 13 }}>Apostar de novo</Button>
          </div>
        </div>
      </div>
    </main>
  )
}
