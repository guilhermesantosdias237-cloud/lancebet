import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { Button, Badge, HoverCard } from '../components/ui.jsx';
import { fmt, ofmt, statusStyleDark, optionCardStyle } from '../lib/format.js';
import iconWhite from '../assets/icon_white.svg';
import iconBlack from '../assets/icon_black.svg';

export default function EventDetail() {
  const { id } = useParams();
  const { events, currentUser, placeBet, showToast } = useApp();
  const navigate = useNavigate();

  const ev = events.find((e) => e.id === Number(id));
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [stake, setStake] = useState('');

  if (!ev) {
    return (
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px' }}>
        <p style={{ fontWeight: 600 }}>Evento não encontrado.</p>
        <Button onClick={() => navigate('/eventos')} style={{ marginTop: 14 }}>Voltar aos eventos</Button>
      </main>
    );
  }

  const selOpt = ev.opcoes.find((o) => o.id === selectedOpt);
  const stakeN = parseFloat(String(stake).replace(',', '.')) || 0;
  const retorno = selOpt && stakeN > 0 ? Math.round(stakeN * selOpt.odd * 100) / 100 : 0;
  const lucro = selOpt && stakeN > 0 ? Math.round((stakeN * selOpt.odd - stakeN) * 100) / 100 : 0;

  const pick = (o) => {
    if (o.status !== 'ATIVA') return showToast('Mercado suspenso.');
    setSelectedOpt(o.id);
  };
  const confirm = () => {
    const res = placeBet(ev.id, selectedOpt, stake);
    if (!res.ok) return showToast(res.error);
    navigate('/aposta-confirmada');
  };

  const quick = [['10', 10], ['25', 25], ['50', 50], ['MÁX', Math.floor(currentUser.saldo)]];

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '30px 28px 64px' }}>
      <button onClick={() => navigate('/eventos')} style={{ background: 'transparent', border: 'none', color: '#7F7F7F', fontWeight: 700, fontSize: 12.5, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 18 }}>← Voltar aos eventos</button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ background: '#000', color: '#fff', padding: '34px', position: 'relative', overflow: 'hidden' }}>
            <img src={iconWhite} alt="" style={{ position: 'absolute', right: -40, top: -30, height: 230, opacity: 0.06 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', color: '#B3B5B7' }}>{ev.competicao}</span>
              <Badge style={{ fontSize: 10, padding: '3px 8px', ...statusStyleDark(ev.status) }}>{ev.status}</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, lineHeight: 1 }}>{ev.mandante}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#7F7F7F' }}>×</div>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, lineHeight: 1 }}>{ev.visitante}</div>
            </div>
            <div style={{ fontSize: 13, color: '#B3B5B7', fontWeight: 600, marginTop: 16 }}>{ev.dataFmt}</div>
          </div>

          <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, margin: '30px 0 14px' }}>Resultado final · 1X2</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {ev.opcoes.map((o) => {
              const sel = o.id === selectedOpt;
              const sus = o.status !== 'ATIVA';
              const label = sus ? 'INDISPONÍVEL' : sel ? 'SELECIONADO ✓' : 'APOSTAR';
              const labelStyle = sus
                ? { background: 'transparent', color: '#B3B5B7', border: '1px solid #DCDCDC' }
                : sel
                ? { background: '#fff', color: '#000' }
                : { background: '#000', color: '#fff' };
              return (
                <HoverCard key={o.id} onClick={() => pick(o)} hoverStyle={{ borderColor: '#000', transform: 'translateY(-2px)' }} style={{ cursor: 'pointer', padding: '20px 16px 16px', textAlign: 'center', ...optionCardStyle(sel, sus) }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: sel ? '#B3B5B7' : '#7F7F7F' }}>{o.sub}</div>
                  <div style={{ fontWeight: 900, fontSize: 17, margin: '6px 0 10px' }}>{o.descricao}</div>
                  <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 30, lineHeight: 1 }}>{ofmt(o.odd)}</div>
                  <div style={{ marginTop: 14, padding: '8px 0', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', ...labelStyle }}>{label}</div>
                </HoverCard>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E4E4E4', position: 'sticky', top: 86 }}>
          <div style={{ background: '#000', color: '#fff', padding: '14px 20px', fontWeight: 800, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' }}>Boletim de aposta</div>
          <div style={{ padding: '22px 20px' }}>
            {selOpt ? (
              <>
                <div style={{ border: '1px solid #E4E4E4', padding: 14, marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{ev.titulo}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>{selOpt.descricao}</span>
                    <span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 18 }}>{ofmt(selOpt.odd)}</span>
                  </div>
                </div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Valor da aposta (R$)</label>
                <input value={stake} onChange={(e) => setStake(e.target.value.replace(/[^\d.,]/g, ''))} inputMode="decimal" placeholder="0,00" style={{ width: '100%', padding: '14px 15px', border: '1.5px solid #DCDCDC', fontSize: 20, fontWeight: 800, marginBottom: 10 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 20 }}>
                  {quick.map(([lbl, val]) => (
                    <button key={lbl} onClick={() => setStake(String(val))} style={{ border: '1px solid #DCDCDC', background: '#fff', padding: '9px 0', fontWeight: 800, fontSize: lbl === 'MÁX' ? 11 : 12, cursor: 'pointer' }}>{lbl}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid #EFEFEF', fontSize: 13 }}>
                  <span style={{ color: '#7F7F7F', fontWeight: 600 }}>Lucro potencial</span><span style={{ fontWeight: 800 }}>{fmt(lucro)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0 16px', fontSize: 15 }}>
                  <span style={{ fontWeight: 800 }}>Retorno total</span><span style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 20 }}>{fmt(retorno)}</span>
                </div>
                <Button onClick={confirm} style={{ width: '100%' }}>Confirmar aposta</Button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#B3B5B7' }}>
                <img src={iconBlack} alt="" style={{ height: 60, opacity: 0.12, marginBottom: 14 }} />
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#7F7F7F', margin: 0, lineHeight: 1.5 }}>Selecione um mercado ao lado para montar sua aposta.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
