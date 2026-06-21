import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import { Button } from '../../components/ui.jsx';
import { ofmt, pickStyle } from '../../lib/format.js';

export default function AdminOdds() {
  const { id } = useParams();
  const { events, updateOdd, toggleOption, addOption, showToast } = useApp();
  const [selId, setSelId] = useState(events[0] ? events[0].id : null);
  const [newOpt, setNewOpt] = useState({ descricao: '', odd: '' });

  // Preseleciona via /admin/odds/:id (vindo da tela de eventos).
  useEffect(() => {
    if (id) setSelId(Number(id));
  }, [id]);

  const ev = events.find((e) => e.id === selId) || events[0];

  const add = () => {
    const res = addOption(ev.id, newOpt.descricao.trim(), newOpt.odd);
    if (!res.ok) return showToast(res.error);
    setNewOpt({ descricao: '', odd: '' });
  };

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 8px' }}>Mercados &amp; odds</h1>
      <p style={{ fontSize: 14, color: '#7F7F7F', fontWeight: 500, margin: '0 0 24px' }}>Selecione um evento, ajuste odds manualmente, suspenda mercados ou adicione novas opções.</p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Evento</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {events.map((e) => (
            <button key={e.id} onClick={() => setSelId(e.id)} style={{ padding: '9px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', ...pickStyle(e.id === ev.id) }}>{e.titulo}</button>
          ))}
        </div>
      </div>

      {ev && (
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #EFEFEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{ev.titulo}</div>
              <div style={{ fontSize: 12, color: '#7F7F7F', fontWeight: 600 }}>{ev.competicao} · {ev.dataFmt}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.07em', border: '1px solid #DCDCDC', padding: '4px 10px', textTransform: 'uppercase' }}>{ev.status}</span>
          </div>

          {ev.opcoes.map((o) => {
            const sus = o.status !== 'ATIVA';
            return (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', gap: 14, padding: '16px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{o.descricao}</div>
                  <div style={{ fontSize: 11, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{o.sub}{sus ? ' · suspensa' : ''}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: '#7F7F7F', marginBottom: 4 }}>ODD</label>
                  <input defaultValue={o.odd} key={o.odd} onBlur={(e) => updateOdd(ev.id, o.id, e.target.value)} inputMode="decimal" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDCDC', fontSize: 16, fontWeight: 800 }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => toggleOption(ev.id, o.id)} style={{ padding: '8px 14px', fontWeight: 700, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer', ...(sus ? { background: '#000', color: '#fff', border: 'none' } : { background: '#fff', color: '#000', border: '1px solid #DCDCDC' }) }}>{sus ? 'Reativar' : 'Suspender'}</button>
                </div>
              </div>
            );
          })}

          <div style={{ padding: '18px 22px', background: '#FAFAFA', display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: '#7F7F7F', marginBottom: 5 }}>NOVA OPÇÃO</label>
              <input value={newOpt.descricao} onChange={(e) => setNewOpt({ ...newOpt, descricao: e.target.value })} placeholder="Ex.: Ambos marcam" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DCDCDC', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: '#7F7F7F', marginBottom: 5 }}>ODD</label>
              <input value={newOpt.odd} onChange={(e) => setNewOpt({ ...newOpt, odd: e.target.value })} placeholder="1.85" inputMode="decimal" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DCDCDC', fontSize: 14, fontWeight: 700 }} />
            </div>
            <Button onClick={add} style={{ padding: '11px 18px', fontSize: 12 }}>Adicionar</Button>
          </div>
        </div>
      )}
    </main>
  );
}
