// Gerenciar eventos (rota /admin/eventos).
// Porte fiel de design/lancebet-react/src/pages/admin/AdminEvents.jsx.
// Lógica: GET /api/admin/eventos, POST /api/admin/eventos,
// PATCH /api/admin/eventos/{id}/status (abrir/fechar).
import { useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, ApiError } from '../../lib/api'
import { criarEventoSchema } from '../../lib/schemas'
import type { CriarEventoForm } from '../../lib/schemas'
import type { EventoAdmin, PaginaResponse } from '../../lib/types'
import { StatusEvento } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Badge, Button, statusEventoStyle } from '../../components/lancebet/ui'
import { toast } from '../../store/uiStore'
import { fmt } from '../../lib/format'
import Icon from '../../components/ui/Icon'

const labelStyle: CSSProperties = { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }
const inputStyle: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid #DCDCDC', fontSize: 14, marginBottom: 13 }
const oddInput: CSSProperties = { width: '100%', padding: '11px 8px', border: '1.5px solid #DCDCDC', fontSize: 14, fontWeight: 700, textAlign: 'center' }

interface FormState {
  mandante: string
  visitante: string
  competicao: string
  data_hora: string
  oddM: string
  oddE: string
  oddV: string
}

const emptyForm: FormState = { mandante: '', visitante: '', competicao: '', data_hora: '', oddM: '', oddE: '', oddV: '' }

// Converte o valor de <input type="datetime-local"> ("AAAA-MM-DDTHH:MM") para o
// rótulo exibido nos cards/listas, no mesmo padrão do seed ("Sáb · 28 jun · 16:00").
function formatarDataEvento(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const semPonto = (s: string) => s.replace('.', '')
  const wd = cap(semPonto(new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d)))
  const mes = semPonto(new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d))
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${wd} · ${d.getDate()} ${mes} · ${hh}:${mm}`
}

export default function AdminEventosPage() {
  const navigate = useNavigate()
  const carregar = useCallback(() => adminApi.listarEventos({ por_pagina: 100 }), [])
  const { data, carregando, erro, recarregar } = useFetch<PaginaResponse<EventoAdmin>>(carregar, [])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [enviando, setEnviando] = useState(false)

  const eventos = data?.items ?? []

  const submit = async () => {
    const dto: CriarEventoForm = {
      mandante: form.mandante.trim(),
      visitante: form.visitante.trim(),
      competicao: form.competicao.trim() || 'Brasileirão Série A',
      data_hora: form.data_hora ? formatarDataEvento(form.data_hora) : '',
      odd_mandante: Number(form.oddM.replace(',', '.')),
      odd_empate: Number(form.oddE.replace(',', '.')),
      odd_visitante: Number(form.oddV.replace(',', '.')),
    }
    const parsed = criarEventoSchema.safeParse(dto)
    if (!parsed.success) {
      toast.erro(parsed.error.issues[0]?.message || 'Verifique os dados do evento.')
      return
    }
    setEnviando(true)
    try {
      await adminApi.criarEvento(parsed.data)
      toast.sucesso('Evento criado com sucesso.')
      setForm(emptyForm)
      recarregar()
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao criar evento.')
    } finally {
      setEnviando(false)
    }
  }

  const alternarStatus = async (ev: EventoAdmin) => {
    const novo = ev.status === StatusEvento.ABERTO ? StatusEvento.FECHADO : StatusEvento.ABERTO
    try {
      await adminApi.alterarStatusEvento(ev.id, novo)
      toast.sucesso(novo === StatusEvento.ABERTO ? 'Evento reaberto.' : 'Evento fechado.')
      recarregar()
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao alterar status.')
    }
  }

  const iconBtn: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: '1px solid #DCDCDC', background: '#fff', color: '#000', fontSize: 15, cursor: 'pointer' }
  const iconBtnDark: CSSProperties = { ...iconBtn, border: '1px solid #000', background: '#000', color: '#fff' }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Gerenciar eventos</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.8fr 1fr 1.4fr', gap: 12, padding: '13px 20px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            <div>Evento</div><div style={{ textAlign: 'center' }}>Status</div><div style={{ textAlign: 'center' }}>Apostas</div><div style={{ textAlign: 'center' }}>Volume</div><div style={{ textAlign: 'right' }}>Ações</div>
          </div>

          {carregando && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando…</div>}
          {!carregando && erro && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Não foi possível carregar os eventos.</div>}
          {!carregando && !erro && eventos.length === 0 && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhum evento cadastrado.</div>}

          {eventos.map((e) => (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.8fr 1fr 1.4fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 900, fontSize: 14 }}>{e.titulo}</div><div style={{ fontSize: 11.5, color: '#7F7F7F', fontWeight: 600 }}>{e.data_hora || '—'}</div></div>
              <div style={{ textAlign: 'center' }}><Badge style={{ fontSize: 9.5, padding: '3px 8px', ...statusEventoStyle(e.status) }}>{e.status}</Badge></div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 14 }}>{e.total_apostas}</div>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{fmt(e.volume_apostado)}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => navigate('/admin/odds/' + e.id)} title="Editar odds" aria-label="Editar odds" style={iconBtn}><Icon name="percent" size={15} /></button>
                {e.status !== StatusEvento.LIQUIDADO && (
                  <button onClick={() => alternarStatus(e)} title={e.status === StatusEvento.ABERTO ? 'Fechar evento' : 'Reabrir evento'} aria-label={e.status === StatusEvento.ABERTO ? 'Fechar evento' : 'Reabrir evento'} style={iconBtn}><Icon name={e.status === StatusEvento.ABERTO ? 'lock' : 'unlock'} size={15} /></button>
                )}
                {e.status !== StatusEvento.LIQUIDADO && (
                  <button onClick={() => navigate('/admin/resultados')} title="Lançar resultado" aria-label="Lançar resultado" style={iconBtnDark}><Icon name="trophy" size={15} /></button>
                )}
              </div>
            </div>
          ))}
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
            <input type="datetime-local" value={form.data_hora} onChange={(e) => setForm({ ...form, data_hora: e.target.value })} style={inputStyle} />
            <div style={labelStyle}>Odds 1 · X · 2</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
              <input value={form.oddM} onChange={(e) => setForm({ ...form, oddM: e.target.value })} placeholder="1.90" inputMode="decimal" style={oddInput} />
              <input value={form.oddE} onChange={(e) => setForm({ ...form, oddE: e.target.value })} placeholder="3.20" inputMode="decimal" style={oddInput} />
              <input value={form.oddV} onChange={(e) => setForm({ ...form, oddV: e.target.value })} placeholder="3.80" inputMode="decimal" style={oddInput} />
            </div>
            <Button onClick={submit} disabled={enviando} style={{ width: '100%', padding: 14, fontSize: 13, opacity: enviando ? 0.6 : 1 }}>{enviando ? 'Criando…' : 'Criar evento'}</Button>
          </div>
        </div>
      </div>
    </main>
  )
}
