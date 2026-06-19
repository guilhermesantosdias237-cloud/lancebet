import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Button, HoverCard } from '../../components/ui.jsx';
import { ofmt, pickStyle, optionCardStyle } from '../../lib/format.js';

export default function AdminResult() {
  const { events, bets, liquidate, showToast } = useApp();
  const [selId, setSelId] = useState(null);
  const [winner, setWinner] = useState(null);
  const [desc, setDesc] = useState('');

  const open = events.filter((e) => e.status !== 'LIQUIDADO');
  const ev = events.find((e) => e.id === selId) || null;

  const selectEvent = (id) => {
    setSelId(id);
    setWinner(null);
  };
  const submit = () => {
    const res = liquidate(selId, winner, desc);
    if (!res.ok) return showToast(res.error);
    setSelId(null);
    setWinner(null);
    setDesc('');
  };

  const nApostas = ev ? bets.filter((b) => b.eventoId === ev.id && b.status === 'ABERTA').length : 0;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 8px' }}>Registrar resultado</h1>
      <p style={{ fontSize: 14, color: '#7F7F7F', fontWeight: 500, margin: '0 0 24px' }}>Escolha o evento, marque a opção vencedora e liquide as apostas automaticamente.</p>

      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Evento a liquidar</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {open.map((e) => (
          <button key={e.id} onClick={() => selectEvent(e.id)} style={{ padding: '9px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', ...pickStyle(e.id === selId) }}>{e.titulo}</button>
        ))}
      </div>

      {ev ? (
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ background: '#000', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22 }}>{ev.titulo}</div>
              <div style={{ fontSize: 12, color: '#B3B5B7', fontWeight: 600 }}>{ev.dataFmt}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26 }}>{nApostas}</div>
              <div style={{ fontSize: 10, color: '#B3B5B7', fontWeight: 700, letterSpacing: '.06em' }}>APOSTAS EM ABERTO</div>
            </div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Marque a opção vencedora</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
              {ev.opcoes.map((o) => {
                const sel = o.id === winner;
                return (
                  <HoverCard key={o.id} onClick={() => setWinner(o.id)} hoverStyle={{ borderColor: '#000', transform: 'translateY(-2px)' }} style={{ cursor: 'pointer', padding: '18px 14px', textAlign: 'center', ...optionCardStyle(sel, false) }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: sel ? '#B3B5B7' : '#7F7F7F' }}>{o.sub}</div>
                    <div style={{ fontWeight: 900, fontSize: 16, margin: '5px 0 8px' }}>{o.descricao}</div>
                    <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24 }}>{ofmt(o.odd)}</div>
                  </HoverCard>
                );
              })}
            </div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 7 }}>Descrição do resultado (opcional)</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex.: Flamengo 2 x 1 Palmeiras" style={{ width: '100%', padding: '13px 15px', border: '1.5px solid #DCDCDC', fontSize: 15, marginBottom: 20 }} />
            <Button onClick={submit} style={{ width: '100%' }}>Liquidar apostas</Button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 54, textAlign: 'center', color: '#7F7F7F' }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Selecione um evento acima para registrar o resultado.</p>
        </div>
      )}
    </main>
  );
}
