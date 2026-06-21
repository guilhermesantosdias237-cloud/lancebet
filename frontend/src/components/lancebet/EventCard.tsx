// Card de evento reutilizado na Home, Painel e lista de Eventos
// (portado de design/lancebet-react/src/components/EventCard.jsx).
import { useNavigate } from 'react-router-dom'
import type { Evento } from '../../lib/types'
import { ofmt } from '../../lib/format'
import { escudoDeTime } from '../../lib/imagens'
import { HoverCard, Badge, statusEventoStyle } from './ui'

/** Nome do time com o escudo gerado ao lado (quando houver). */
function Time({ nome }: { nome: string }) {
  const escudo = escudoDeTime(nome)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      {escudo && <img src={escudo} alt="" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }} />}
      <span style={{ fontWeight: 900, fontSize: 21 }}>{nome}</span>
    </div>
  )
}

export default function EventCard({ event }: { event: Evento }) {
  const navigate = useNavigate()
  const odds = event.opcoes.slice(0, 3)
  return (
    <HoverCard
      onClick={() => navigate('/eventos/' + event.id)}
      style={{ background: '#fff', borderWidth: 1, borderStyle: 'solid', borderColor: '#E4E4E4', cursor: 'pointer' }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: '#7F7F7F', textTransform: 'uppercase' }}>{event.competicao}</span>
        <Badge style={{ fontSize: 10, letterSpacing: '.08em', padding: '3px 8px', ...statusEventoStyle(event.status) }}>{event.status}</Badge>
      </div>
      <div style={{ padding: 18 }}>
        <Time nome={event.mandante} />
        <div style={{ fontSize: 12, fontWeight: 700, color: '#B3B5B7', margin: '5px 0' }}>VS</div>
        <Time nome={event.visitante} />
        <div style={{ fontSize: 11.5, color: '#7F7F7F', fontWeight: 600, marginTop: 12 }}>{event.data_hora ?? 'A definir'}</div>
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
  )
}
