import { useApp } from '../context/AppContext.jsx';
import { fmt } from '../lib/format.js';

export default function Wallet() {
  const { currentUser, bets, movements } = useApp();
  const myAll = bets.filter((b) => b.usuarioId === currentUser.id);
  const myMov = movements.filter((m) => m.userId === currentUser.id);
  const totalApostado = fmt(myAll.reduce((a, b) => a + b.valor, 0));
  const totalGanho = fmt(myMov.filter((m) => m.tipo === 'GANHO').reduce((a, m) => a + m.valor, 0));

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 24px' }}>Carteira</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 34 }}>
        <div style={{ background: '#000', color: '#fff', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#B3B5B7' }}>SALDO FICTÍCIO</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 38, marginTop: 10 }}>{fmt(currentUser.saldo)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7F7F7F' }}>Total apostado</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, marginTop: 10 }}>{totalApostado}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7F7F7F' }}>Total em ganhos</div>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, marginTop: 10 }}>{totalGanho}</div>
        </div>
      </div>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26, margin: '0 0 16px' }}>Extrato de movimentações</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.4fr 1fr 1fr', gap: 12, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <div>Tipo</div><div>Descrição</div><div style={{ textAlign: 'right' }}>Valor</div><div style={{ textAlign: 'right' }}>Saldo após</div>
        </div>
        {myMov.map((m) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.4fr 1fr 1fr', gap: 12, padding: '15px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
            <div><span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', border: '1px solid #DCDCDC', padding: '3px 7px', textTransform: 'uppercase' }}>{m.tipo}</span></div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.descricao}</div>
              <div style={{ fontSize: 11.5, color: '#B3B5B7', fontWeight: 600, marginTop: 2 }}>{m.criadoEm}</div>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: m.valor >= 0 ? '#000' : '#7F7F7F' }}>
              {(m.valor >= 0 ? '+ ' : '− ') + fmt(Math.abs(m.valor)).replace('- ', '')}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#7F7F7F' }}>{fmt(m.saldoApos)}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
