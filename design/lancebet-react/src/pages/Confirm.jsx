import { Navigate, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { Button } from '../components/ui.jsx';
import { fmt, ofmt, proto } from '../lib/format.js';
import iconWhite from '../assets/icon_white.svg';

const row = { display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F0F0F0' };
const label = { color: '#7F7F7F', fontWeight: 600, fontSize: 14 };
const val = { fontWeight: 800, fontSize: 14 };

export default function Confirm() {
  const { lastBet } = useApp();
  const navigate = useNavigate();
  if (!lastBet) return <Navigate to="/eventos" replace />;

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '54px 28px 64px' }}>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ background: '#000', color: '#fff', padding: 36, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <img src={iconWhite} alt="" style={{ position: 'absolute', right: -30, bottom: -40, height: 180, opacity: 0.07 }} />
          <div style={{ width: 54, height: 54, border: '3px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26, fontWeight: 900 }}>✓</div>
          <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 30, margin: 0 }}>Aposta confirmada!</h1>
          <div style={{ fontSize: 13, color: '#B3B5B7', fontWeight: 600, letterSpacing: '.06em', marginTop: 8 }}>PROTOCOLO {proto(lastBet.id)}</div>
        </div>
        <div style={{ padding: '30px 34px' }}>
          <div style={row}><span style={label}>Evento</span><span style={val}>{lastBet.titulo}</span></div>
          <div style={row}><span style={label}>Palpite</span><span style={val}>{lastBet.opcaoDesc}</span></div>
          <div style={row}><span style={label}>Data / hora</span><span style={val}>{lastBet.criadaEm}</span></div>
          <div style={row}><span style={label}>Valor apostado</span><span style={val}>{fmt(lastBet.valor)}</span></div>
          <div style={row}><span style={label}>Odd registrada</span><span style={val}>{ofmt(lastBet.odd)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0 6px' }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Retorno potencial</span>
            <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26 }}>{fmt(lastBet.retorno)}</span>
          </div>
          <div style={{ background: '#F4F4F4', padding: '13px 16px', fontSize: 13, color: '#7F7F7F', fontWeight: 600, margin: '18px 0 24px' }}>
            Novo saldo fictício: <strong style={{ color: '#000' }}>{fmt(lastBet.saldoApos)}</strong>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => navigate('/minhas-apostas')} style={{ flex: 1, padding: 15, fontSize: 13 }}>Minhas apostas</Button>
            <Button variant="outline" onClick={() => navigate('/eventos')} style={{ flex: 1, padding: 15, fontSize: 13 }}>Apostar de novo</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
