// Mercados & odds (rotas /admin/odds e /admin/odds/:id).
// Porte fiel de design/lancebet-react/src/pages/admin/AdminOdds.jsx.
// Lógica: GET /api/admin/eventos (selector), GET /api/admin/eventos/{id}/opcoes,
// PATCH /api/admin/opcoes/{id}/odd, PATCH /api/admin/opcoes/{id}/status,
// POST /api/admin/eventos/{id}/opcoes.
import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { adminApi, ApiError } from '../../lib/api'
import { adicionarOpcaoSchema } from '../../lib/schemas'
import type { EventoAdmin, OpcaoAposta, PaginaResponse } from '../../lib/types'
import { StatusOpcao, StatusEvento } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Button, pickStyle } from '../../components/lancebet/ui'
import { toast } from '../../store/uiStore'

export default function AdminOddsPage() {
  const { id } = useParams()
  const carregarEventos = useCallback(() => adminApi.listarEventos({ por_pagina: 100 }), [])
  const { data: pagina, carregando } = useFetch<PaginaResponse<EventoAdmin>>(carregarEventos, [])
  const eventos = pagina?.items ?? []

  const [selId, setSelId] = useState<number | null>(null)
  const [opcoes, setOpcoes] = useState<OpcaoAposta[]>([])
  const [newOpt, setNewOpt] = useState({ descricao: '', odd: '' })

  // Preseleciona via /admin/odds/:id ou primeiro evento da lista.
  useEffect(() => {
    if (id) {
      setSelId(Number(id))
    } else if (selId === null && eventos.length > 0) {
      setSelId(eventos[0].id)
    }
  }, [id, eventos, selId])

  const recarregarOpcoes = useCallback(async (eventoId: number) => {
    try {
      const lista = await adminApi.listarOpcoes(eventoId)
      setOpcoes(lista)
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao carregar opções.')
    }
  }, [])

  useEffect(() => {
    if (selId != null) recarregarOpcoes(selId)
  }, [selId, recarregarOpcoes])

  const ev = eventos.find((e) => e.id === selId) || null

  const salvarOdd = async (opcao: OpcaoAposta, valorTexto: string) => {
    const odd = Number(valorTexto.replace(',', '.'))
    if (!(odd > 1)) {
      toast.erro('A odd deve ser maior que 1,00.')
      recarregarOpcoes(selId as number)
      return
    }
    if (odd === opcao.odd) return
    try {
      await adminApi.atualizarOdd(opcao.id, odd)
      toast.sucesso('Odd atualizada.')
      recarregarOpcoes(selId as number)
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao atualizar odd.')
      recarregarOpcoes(selId as number)
    }
  }

  const alternarOpcao = async (opcao: OpcaoAposta) => {
    const novo = opcao.status === StatusOpcao.ATIVA ? StatusOpcao.SUSPENSA : StatusOpcao.ATIVA
    try {
      await adminApi.alterarStatusOpcao(opcao.id, novo)
      toast.sucesso(novo === StatusOpcao.ATIVA ? 'Opção reativada.' : 'Opção suspensa.')
      recarregarOpcoes(selId as number)
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao alterar opção.')
    }
  }

  const adicionar = async () => {
    if (selId == null) return
    const parsed = adicionarOpcaoSchema.safeParse({
      descricao: newOpt.descricao.trim(),
      sub: 'Mercado',
      odd: Number(newOpt.odd.replace(',', '.')),
    })
    if (!parsed.success) {
      toast.erro(parsed.error.issues[0]?.message || 'Verifique os dados da opção.')
      return
    }
    try {
      await adminApi.adicionarOpcao(selId, parsed.data)
      toast.sucesso('Opção adicionada.')
      setNewOpt({ descricao: '', odd: '' })
      recarregarOpcoes(selId)
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao adicionar opção.')
    }
  }

  const liquidado = ev?.status === StatusEvento.LIQUIDADO

  const pillBtn = (sus: boolean): CSSProperties => ({
    padding: '8px 14px',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    ...(sus ? { background: '#000', color: '#fff', border: 'none' } : { background: '#fff', color: '#000', border: '1px solid #DCDCDC' }),
  })

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 8px' }}>Mercados &amp; odds</h1>
      <p style={{ fontSize: 14, color: '#7F7F7F', fontWeight: 500, margin: '0 0 24px' }}>Selecione um evento, ajuste odds manualmente, suspenda mercados ou adicione novas opções.</p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Evento</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {carregando && <span style={{ color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando eventos…</span>}
          {!carregando && eventos.length === 0 && <span style={{ color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhum evento cadastrado.</span>}
          {eventos.map((e) => (
            <button key={e.id} onClick={() => setSelId(e.id)} style={{ padding: '9px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', ...pickStyle(e.id === selId) }}>{e.titulo}</button>
          ))}
        </div>
      </div>

      {ev && (
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #EFEFEF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{ev.titulo}</div>
              <div style={{ fontSize: 12, color: '#7F7F7F', fontWeight: 600 }}>{ev.competicao} · {ev.data_hora || '—'}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.07em', border: '1px solid #DCDCDC', padding: '4px 10px', textTransform: 'uppercase' }}>{ev.status}</span>
          </div>

          {liquidado && (
            <div style={{ padding: '14px 22px', background: '#FAFAFA', color: '#7F7F7F', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #F0F0F0' }}>Evento liquidado — odds e mercados não podem mais ser alterados.</div>
          )}

          {opcoes.map((o) => {
            const sus = o.status !== StatusOpcao.ATIVA
            return (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', gap: 14, padding: '16px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{o.descricao}</div>
                  <div style={{ fontSize: 11, color: '#7F7F7F', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{o.sub}{sus ? ' · suspensa' : ''}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: '#7F7F7F', marginBottom: 4 }}>ODD</label>
                  <input
                    defaultValue={o.odd}
                    key={o.odd}
                    disabled={liquidado}
                    onBlur={(e) => !liquidado && salvarOdd(o, e.target.value)}
                    inputMode="decimal"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDCDC', fontSize: 16, fontWeight: 800, background: liquidado ? '#F4F4F4' : '#fff' }}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => alternarOpcao(o)} disabled={liquidado} style={{ ...pillBtn(sus), opacity: liquidado ? 0.5 : 1 }}>{sus ? 'Reativar' : 'Suspender'}</button>
                </div>
              </div>
            )
          })}

          {!liquidado && (
            <div style={{ padding: '18px 22px', background: '#FAFAFA', display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: '#7F7F7F', marginBottom: 5 }}>NOVA OPÇÃO</label>
                <input value={newOpt.descricao} onChange={(e) => setNewOpt({ ...newOpt, descricao: e.target.value })} placeholder="Ex.: Ambos marcam" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DCDCDC', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: '#7F7F7F', marginBottom: 5 }}>ODD</label>
                <input value={newOpt.odd} onChange={(e) => setNewOpt({ ...newOpt, odd: e.target.value })} placeholder="1.85" inputMode="decimal" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DCDCDC', fontSize: 14, fontWeight: 700 }} />
              </div>
              <Button onClick={adicionar} style={{ padding: '11px 18px', fontSize: 12 }}>Adicionar</Button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
