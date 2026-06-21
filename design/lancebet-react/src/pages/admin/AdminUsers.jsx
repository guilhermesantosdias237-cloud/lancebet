import { useApp } from '../../context/AppContext.jsx';
import { Badge } from '../../components/ui.jsx';
import { fmt, ofmt, badgeLabel, badgeStyle } from '../../lib/format.js';

export default function AdminUsers() {
  const { users, bets } = useApp();
  const allBets = bets.map((b) => ({ ...b, user: (users.find((u) => u.id === b.usuarioId) || {}).nome || '—' }));

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Usuários &amp; apostas</h1>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24, margin: '0 0 14px' }}>Usuários cadastrados</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4', marginBottom: 38 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 0.8fr 1fr', gap: 12, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
          <div>Nome</div><div>E-mail</div><div>Perfil</div><div style={{ textAlign: 'right' }}>Saldo</div><div style={{ textAlign: 'center' }}>Apostas</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {users.map((u) => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 0.8fr 1fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{u.nome}</div>
            <div style={{ fontSize: 12.5, color: '#7F7F7F', fontWeight: 600 }}>{u.email}</div>
            <div><span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.05em', border: '1px solid #DCDCDC', padding: '3px 7px' }}>{u.perfil}</span></div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5 }}>{fmt(u.saldo)}</div>
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 13.5 }}>{bets.filter((b) => b.usuarioId === u.id).length}</div>
            <div style={{ textAlign: 'right' }}>
              <Badge style={{ fontSize: 9.5, padding: '3px 9px', ...(u.status === 'BLOQUEADO' ? { background: '#fff', border: '1px solid #000', color: '#000' } : { background: '#000', color: '#fff' }) }}>{u.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24, margin: '0 0 14px' }}>Histórico geral de apostas</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 1fr 0.8fr 1fr 1.1fr', gap: 12, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
          <div>Usuário</div><div>Evento · palpite</div><div style={{ textAlign: 'right' }}>Valor</div><div style={{ textAlign: 'right' }}>Odd</div><div style={{ textAlign: 'right' }}>Retorno</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {allBets.map((b) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 1fr 0.8fr 1fr 1.1fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{b.user}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{b.titulo} <span style={{ color: '#7F7F7F' }}>· {b.opcaoDesc}</span></div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13 }}>{fmt(b.valor)}</div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13 }}>{ofmt(b.odd)}</div>
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{fmt(b.retorno)}</div>
            <div style={{ textAlign: 'right' }}><Badge style={{ fontSize: 9.5, padding: '4px 9px', ...badgeStyle(b) }}>{badgeLabel(b)}</Badge></div>
          </div>
        ))}
      </div>
    </main>
  );
}
