import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import { Badge } from '../../components/ui.jsx';
import { fmt, ofmt, badgeLabel, badgeStyle } from '../../lib/format.js';

export default function AdminDashboard() {
  const { events, bets, users } = useApp();
  const navigate = useNavigate();

  const stats = {
    eventosAtivos: events.filter((e) => e.status === 'ABERTO').length,
    volume: fmt(bets.reduce((a, b) => a + b.valor, 0)),
    usuarios: users.filter((u) => u.perfil === 'APOSTADOR').length,
    pendentes: bets.filter((b) => b.status === 'ABERTA').length,
  };
  const recent = bets.slice(0, 5).map((b) => ({ ...b, user: (users.find((u) => u.id === b.usuarioId) || {}).nome || '—' }));

  const statCards = [
    { lbl: 'EVENTOS ATIVOS', val: stats.eventosAtivos, dark: true, big: 42 },
    { lbl: 'VOLUME APOSTADO', val: stats.volume, big: 30 },
    { lbl: 'APOSTADORES', val: stats.usuarios, big: 42 },
    { lbl: 'APOSTAS PENDENTES', val: stats.pendentes, big: 42 },
  ];

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', textTransform: 'uppercase' }}>Área administrativa</div>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '8px 0 26px' }}>Painel de controle</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 34 }}>
        {statCards.map((c, i) => (
          <div key={i} style={{ background: c.dark ? '#000' : '#fff', color: c.dark ? '#fff' : '#000', border: c.dark ? 'none' : '1px solid #E4E4E4', padding: 24 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', color: c.dark ? '#B3B5B7' : '#7F7F7F' }}>{c.lbl}</div>
            <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: c.big, marginTop: 8 }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 30 }}>
        <button onClick={() => navigate('/admin/eventos')} style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 22, textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontWeight: 900, fontSize: 17 }}>Gerenciar eventos →</div>
          <div style={{ fontSize: 13, color: '#7F7F7F', fontWeight: 500, marginTop: 4 }}>Cadastrar, abrir, fechar e encerrar jogos.</div>
        </button>
        <button onClick={() => navigate('/admin/resultados')} style={{ background: '#fff', border: '1px solid #E4E4E4', padding: 22, textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ fontWeight: 900, fontSize: 17 }}>Registrar resultado →</div>
          <div style={{ fontSize: 13, color: '#7F7F7F', fontWeight: 500, marginTop: 4 }}>Liquidar apostas automaticamente.</div>
        </button>
      </div>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26, margin: '0 0 16px' }}>Apostas recentes</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1.1fr', gap: 12, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <div>Usuário</div><div>Evento</div><div style={{ textAlign: 'right' }}>Valor</div><div style={{ textAlign: 'right' }}>Odd</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {recent.map((b) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1.1fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{b.user}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.titulo} <span style={{ color: '#7F7F7F' }}>· {b.opcaoDesc}</span></div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5 }}>{fmt(b.valor)}</div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5 }}>{ofmt(b.odd)}</div>
            <div style={{ textAlign: 'right' }}><Badge style={{ fontSize: 10, padding: '4px 9px', ...badgeStyle(b) }}>{badgeLabel(b)}</Badge></div>
          </div>
        ))}
      </div>
    </main>
  );
}
