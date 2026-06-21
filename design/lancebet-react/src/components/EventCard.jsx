import { useNavigate } from 'react-router';
import { ofmt, statusStyle } from '../lib/format.js';
import { HoverCard, Badge } from './ui.jsx';

// Card de evento reutilizado na Home, Dashboard e lista de Eventos.
export default function EventCard({ event }) {
  const navigate = useNavigate();
  const odds = event.opcoes.slice(0, 3);
  return (
    <HoverCard
      onClick={() => navigate('/eventos/' + event.id)}
      style={{ background: '#fff', border: '1px solid #E4E4E4', cursor: 'pointer' }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: '#7F7F7F', textTransform: 'uppercase' }}>{event.competicao}</span>
        <Badge style={{ fontSize: 10, letterSpacing: '.08em', padding: '3px 8px', ...statusStyle(event.status) }}>{event.status}</Badge>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 900, fontSize: 21 }}>{event.mandante}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#B3B5B7', margin: '3px 0' }}>VS</div>
        <div style={{ fontWeight: 900, fontSize: 21 }}>{event.visitante}</div>
        <div style={{ fontSize: 11.5, color: '#7F7F7F', fontWeight: 600, marginTop: 10 }}>{event.dataFmt}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#EFEFEF' }}>
        {odds.map((o) => (
          <div key={o.id} style={{ background: '#F8F8F8', padding: '10px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#7F7F7F', letterSpacing: '.04em', textTransform: 'uppercase' }}>{o.sub}</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{ofmt(o.odd)}</div>
          </div>
        ))}
      </div>
    </HoverCard>
  );
}
