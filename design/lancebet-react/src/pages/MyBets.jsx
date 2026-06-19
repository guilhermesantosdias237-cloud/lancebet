import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Badge } from '../components/ui.jsx';
import { fmt, ofmt, proto, badgeLabel, badgeStyle, filterStyle } from '../lib/format.js';
import iconBlack from '../assets/icon_black.svg';

const filters = [
  ['todas', 'Todas'],
  ['abertas', 'Em aberto'],
  ['liquidadas', 'Liquidadas'],
];

export default function MyBets() {
  const { currentUser, bets } = useApp();
  const [filter, setFilter] = useState('todas');

  const myAll = bets.filter((b) => b.usuarioId === currentUser.id);
  const list = myAll.filter((b) =>
    filter === 'todas' ? true : filter === 'abertas' ? b.status === 'ABERTA' : b.status === 'LIQUIDADA'
  );

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 22px' }}>Minhas apostas</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {filters.map(([key, lbl]) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: '10px 18px', fontWeight: 800, fontSize: 12, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', ...filterStyle(filter === key) }}>{lbl}</button>
        ))}
      </div>

      {list.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map((b) => (
            <div key={b.id} style={{ background: '#fff', border: '1px solid #E4E4E4', borderLeft: '4px solid #000', padding: '18px 22px', display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1.2fr 1.1fr', gap: 14, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.06em' }}>{proto(b.id)}</div>
                <div style={{ fontWeight: 900, fontSize: 16, marginTop: 2 }}>{b.titulo}</div>
                <div style={{ fontSize: 12.5, color: '#7F7F7F', fontWeight: 600, marginTop: 2 }}>Palpite: {b.opcaoDesc} · {b.criadaEm}</div>
              </div>
              <div><div style={{ fontSize: 10, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.06em' }}>VALOR</div><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(b.valor)}</div></div>
              <div><div style={{ fontSize: 10, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.06em' }}>ODD</div><div style={{ fontWeight: 800, fontSize: 15 }}>{ofmt(b.odd)}</div></div>
              <div><div style={{ fontSize: 10, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.06em' }}>RETORNO POT.</div><div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(b.retorno)}</div></div>
              <div style={{ textAlign: 'right' }}><Badge style={{ padding: '6px 12px', ...badgeStyle(b) }}>{badgeLabel(b)}</Badge></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 60, textAlign: 'center', color: '#7F7F7F' }}>
          <img src={iconBlack} alt="" style={{ height: 54, opacity: 0.12, marginBottom: 14 }} />
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Nenhuma aposta nesta categoria.</p>
        </div>
      )}
    </main>
  );
}
