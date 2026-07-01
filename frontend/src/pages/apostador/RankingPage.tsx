// Ranking de apostadores (rota /ranking).
// Lê GET /api/carteira/ranking e mostra uma tabela ordenada por total ganho.
import { useFetch } from '../../hooks/useFetch'
import { rankingApi } from '../../lib/api'
import { fmt } from '../../lib/format'
import Spinner from '../../components/ui/Spinner'

const head = { display: 'grid', gridTemplateColumns: '0.6fr 2.4fr 1.2fr 1.2fr 1.2fr', gap: 12 } as const

export default function RankingPage() {
  const { data, carregando } = useFetch(() => rankingApi.listar(50), [])
  const itens = data ?? []

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 8px' }}>Ranking</h1>
      <p style={{ fontSize: 14, color: '#7F7F7F', fontWeight: 500, margin: '0 0 24px' }}>
        Apostadores ordenados por total em ganhos.
      </p>

      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ ...head, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <div>#</div>
          <div>Apostador</div>
          <div style={{ textAlign: 'right' }}>Apostado</div>
          <div style={{ textAlign: 'right' }}>Ganho</div>
          <div style={{ textAlign: 'right' }}>Lucro</div>
        </div>

        {carregando ? (
          <Spinner />
        ) : itens.length > 0 ? (
          itens.map((r) => (
            <div key={r.usuario_id} style={{ ...head, padding: '15px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 18 }}>{r.posicao}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{r.nome_usuario}</div>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#7F7F7F' }}>{fmt(r.total_apostado)}</div>
              <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14 }}>{fmt(r.total_ganho)}</div>
              <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: r.lucro >= 0 ? '#000' : '#7F7F7F' }}>{fmt(r.lucro)}</div>
            </div>
          ))
        ) : (
          <div style={{ padding: 50, textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 14 }}>
            Nenhum apostador no ranking ainda.
          </div>
        )}
      </div>
    </main>
  )
}