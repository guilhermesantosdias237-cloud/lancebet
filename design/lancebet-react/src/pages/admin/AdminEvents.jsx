import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import { Badge, Button } from '../../components/ui.jsx';
import { fmt, statusStyle } from '../../lib/format.js';

const labelStyle = { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#555', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '11px 13px', border: '1.5px solid #DCDCDC', fontSize: 14, marginBottom: 13 };
const oddInput = { width: '100%', padding: '11px 8px', border: '1.5px solid #DCDCDC', fontSize: 14, fontWeight: 700, textAlign: 'center' };

const emptyForm = { mandante: '', visitante: '', competicao: '', dataFmt: '', oddM: '', oddE: '', oddV: '' };

export default function AdminEvents() {
  const { events, bets, setEventStatus, createEvent, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const submit = () => {
    const res = createEvent(form);
    if (!res.ok) return showToast(res.error);
    setForm(emptyForm);
  };

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Gerenciar eventos</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.8fr 1fr 1.4fr', gap: 12, padding: '13px 20px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            <div>Evento</div><div>Status</div><div style={{ textAlign: 'center' }}>Apostas</div><div style={{ textAlign: 'right' }}>Volume</div><div style={{ textAlign: 'right' }}>Ações</div>
          </div>
          {events.map((e) => {
            const nApostas = bets.filter((b) => b.eventoId === e.id).length;
            const volume = fmt(bets.filter((b) => b.eventoId === e.id).reduce((a, b) => a + b.valor, 0));
            return (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.8fr 1fr 1.4fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 900, fontSize: 14 }}>{e.titulo}</div><div style={{ fontSize: 11.5, color: '#7F7F7F', fontWeight: 600 }}>{e.dataFmt}</div></div>
                <div><Badge style={{ fontSize: 9.5, padding: '3px 8px', ...statusStyle(e.status) }}>{e.status}</Badge></div>
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 14 }}>{nApostas}</div>
                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{volume}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => navigate('/admin/odds/' + e.id)} style={{ border: '1px solid #DCDCDC', background: '#fff', padding: '6px 10px', fontWeight: 700, fontSize: 10.5, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer' }}>Odds</button>
                  <button onClick={() => setEventStatus(e.id, e.status === 'ABERTO' ? 'FECHADO' : 'ABERTO')} style={{ border: '1px solid #DCDCDC', background: '#fff', padding: '6px 10px', fontWeight: 700, fontSize: 10.5, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer' }}>{e.status === 'ABERTO' ? 'Fechar' : 'Abrir'}</button>
                  <button onClick={() => navigate('/admin/resultados')} style={{ border: 'none', background: '#000', color: '#fff', padding: '6px 10px', fontWeight: 700, fontSize: 10.5, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer' }}>Resultado</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ background: '#000', color: '#fff', padding: '14px 20px', fontWeight: 800, fontSize: 13, letterSpacing: '.07em', textTransform: 'uppercase' }}>Cadastrar evento</div>
          <div style={{ padding: '22px 20px' }}>
            <label style={labelStyle}>Mandante</label>
            <input value={form.mandante} onChange={(e) => setForm({ ...form, mandante: e.target.value })} placeholder="Ex.: Santos" style={inputStyle} />
            <label style={labelStyle}>Visitante</label>
            <input value={form.visitante} onChange={(e) => setForm({ ...form, visitante: e.target.value })} placeholder="Ex.: Vasco" style={inputStyle} />
            <label style={labelStyle}>Competição</label>
            <input value={form.competicao} onChange={(e) => setForm({ ...form, competicao: e.target.value })} placeholder="Brasileirão Série A" style={inputStyle} />
            <label style={labelStyle}>Data / hora</label>
            <input value={form.dataFmt} onChange={(e) => setForm({ ...form, dataFmt: e.target.value })} placeholder="Sáb · 28 jun · 16:00" style={inputStyle} />
            <div style={labelStyle}>Odds 1 · X · 2</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
              <input value={form.oddM} onChange={(e) => setForm({ ...form, oddM: e.target.value })} placeholder="1.90" inputMode="decimal" style={oddInput} />
              <input value={form.oddE} onChange={(e) => setForm({ ...form, oddE: e.target.value })} placeholder="3.20" inputMode="decimal" style={oddInput} />
              <input value={form.oddV} onChange={(e) => setForm({ ...form, oddV: e.target.value })} placeholder="3.80" inputMode="decimal" style={oddInput} />
            </div>
            <Button onClick={submit} style={{ width: '100%', padding: 14, fontSize: 13 }}>Criar evento</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
