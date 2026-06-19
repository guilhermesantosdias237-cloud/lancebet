import { useApp } from '../context/AppContext.jsx';
import EventCard from '../components/EventCard.jsx';

export default function Events() {
  const { events } = useApp();
  const list = events.filter((e) => e.status !== 'LIQUIDADO');
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', textTransform: 'uppercase' }}>Brasileirão Série A · 2026</div>
        <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '8px 0 0' }}>Eventos disponíveis</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {list.map((ev) => <EventCard key={ev.id} event={ev} />)}
      </div>
    </main>
  );
}
