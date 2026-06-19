// Painel administrativo (rota /admin).
// Porte fiel de design/lancebet-react/src/pages/admin/AdminDashboard.jsx,
// trocando o AppContext mock por GET /api/admin/dashboard via adminApi.
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/api'
import type { AdminDashboard } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Badge } from '../../components/lancebet/ui'
import { apostaBadgeLabel, apostaBadgeStyle } from '../../components/lancebet/ui'
import { fmt, ofmt } from '../../lib/format'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const carregar = useCallback(() => adminApi.dashboard(), [])
  const { data, carregando, erro } = useFetch<AdminDashboard>(carregar, [])

  const stats = data ?? {
    eventos_ativos: 0,
    volume_apostado: 0,
    total_apostadores: 0,
    apostas_pendentes: 0,
    apostas_recentes: [],
  }

  const statCards = [
    { lbl: 'EVENTOS ATIVOS', val: String(stats.eventos_ativos), dark: true, big: 42 },
    { lbl: 'VOLUME APOSTADO', val: fmt(stats.volume_apostado), big: 30 },
    { lbl: 'APOSTADORES', val: String(stats.total_apostadores), big: 42 },
    { lbl: 'APOSTAS PENDENTES', val: String(stats.apostas_pendentes), big: 42 },
  ]

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

        {carregando && (
          <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando…</div>
        )}
        {!carregando && erro && (
          <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Não foi possível carregar o painel.</div>
        )}
        {!carregando && !erro && stats.apostas_recentes.length === 0 && (
          <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhuma aposta registrada ainda.</div>
        )}

        {stats.apostas_recentes.map((b) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1.1fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{b.nome_usuario || '—'}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.titulo_evento} <span style={{ color: '#7F7F7F' }}>· {b.descricao_opcao}</span></div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5 }}>{fmt(b.valor_apostado)}</div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5 }}>{ofmt(b.odd_registrada)}</div>
            <div style={{ textAlign: 'right' }}><Badge style={{ fontSize: 10, padding: '4px 9px', ...apostaBadgeStyle(b) }}>{apostaBadgeLabel(b)}</Badge></div>
          </div>
        ))}
      </div>
    </main>
  )
}
