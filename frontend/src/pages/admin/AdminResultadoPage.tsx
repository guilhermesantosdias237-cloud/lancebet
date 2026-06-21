// Registrar resultado / liquidação (rota /admin/resultados).
// Porte fiel de design/lancebet-react/src/pages/admin/AdminResult.jsx.
// Lógica: GET /api/admin/eventos (selector de não-liquidados),
// GET /api/admin/apostas?evento_id=&status=Aberta (contagem em aberto),
// POST /api/admin/eventos/{id}/liquidar.
import { useCallback, useEffect, useState } from 'react'
import { adminApi, ApiError } from '../../lib/api'
import { liquidarEventoSchema } from '../../lib/schemas'
import type { EventoAdmin, PaginaResponse } from '../../lib/types'
import { StatusEvento, StatusAposta } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Button, HoverCard, optionCardStyle, pickStyle } from '../../components/lancebet/ui'
import { toast } from '../../store/uiStore'
import { useUIStore } from '../../store/uiStore'
import { ofmt, fmt } from '../../lib/format'

export default function AdminResultadoPage() {
  const carregar = useCallback(() => adminApi.listarEventos({ por_pagina: 100 }), [])
  const { data: pagina, recarregar } = useFetch<PaginaResponse<EventoAdmin>>(carregar, [])
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)

  const [selId, setSelId] = useState<number | null>(null)
  const [winner, setWinner] = useState<number | null>(null)
  const [desc, setDesc] = useState('')
  const [nAbertas, setNAbertas] = useState<number | null>(null)
  const [enviando, setEnviando] = useState(false)

  const eventos = pagina?.items ?? []
  const abertos = eventos.filter((e) => e.status !== StatusEvento.LIQUIDADO)
  const ev = eventos.find((e) => e.id === selId) || null

  useEffect(() => {
    if (selId == null) {
      setNAbertas(null)
      return
    }
    let cancelado = false
    adminApi
      .listarApostas({ evento_id: selId, status: StatusAposta.ABERTA, por_pagina: 1 })
      .then((r) => { if (!cancelado) setNAbertas(r.total) })
      .catch(() => { if (!cancelado) setNAbertas(null) })
    return () => { cancelado = true }
  }, [selId])

  const selecionar = (id: number) => {
    setSelId(id)
    setWinner(null)
    setDesc('')
  }

  const executarLiquidacao = async () => {
    if (selId == null) return
    const parsed = liquidarEventoSchema.safeParse({
      opcao_vencedora_id: winner ?? 0,
      resultado_descricao: desc.trim(),
    })
    if (!parsed.success) {
      toast.erro(parsed.error.issues[0]?.message || 'Selecione a opção vencedora.')
      return
    }
    setEnviando(true)
    try {
      const res = await adminApi.liquidarEvento(selId, parsed.data)
      toast.sucesso(
        `Evento liquidado. ${res.apostas_liquidadas} aposta(s) processada(s), ` +
          `${res.apostas_ganhadoras} ganhadora(s), ${fmt(res.total_pago)} creditado(s).`,
      )
      setSelId(null)
      setWinner(null)
      setDesc('')
      setNAbertas(null)
      recarregar()
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao liquidar evento.')
    } finally {
      setEnviando(false)
    }
  }

  const submit = () => {
    if (winner == null) {
      toast.erro('Marque a opção vencedora antes de liquidar.')
      return
    }
    const opcao = ev?.opcoes.find((o) => o.id === winner)
    pedirConfirmacao({
      titulo: 'Liquidar apostas',
      mensagem: `Confirmar liquidação de "${ev?.titulo}" com a opção "${opcao?.descricao}" como vencedora?`,
      detalhes: 'Esta ação processa todas as apostas em aberto e credita os ganhos. Não pode ser desfeita.',
      textoConfirmar: 'Liquidar',
      tipo: 'warning',
      onConfirmar: executarLiquidacao,
    })
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 8px' }}>Registrar resultado</h1>
      <p style={{ fontSize: 14, color: '#7F7F7F', fontWeight: 500, margin: '0 0 24px' }}>Escolha o evento, marque a opção vencedora e liquide as apostas automaticamente.</p>

      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Evento a liquidar</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {abertos.length === 0 && <span style={{ color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhum evento disponível para liquidação.</span>}
        {abertos.map((e) => (
          <button key={e.id} onClick={() => selecionar(e.id)} style={{ padding: '9px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', ...pickStyle(e.id === selId) }}>{e.titulo}</button>
        ))}
      </div>

      {ev ? (
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ background: '#000', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22 }}>{ev.titulo}</div>
              <div style={{ fontSize: 12, color: '#B3B5B7', fontWeight: 600 }}>{ev.data_hora || '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 26 }}>{nAbertas ?? '—'}</div>
              <div style={{ fontSize: 10, color: '#B3B5B7', fontWeight: 700, letterSpacing: '.06em' }}>APOSTAS EM ABERTO</div>
            </div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Marque a opção vencedora</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
              {ev.opcoes.map((o) => {
                const sel = o.id === winner
                return (
                  <HoverCard key={o.id} onClick={() => setWinner(o.id)} hoverStyle={{ borderColor: '#000', transform: 'translateY(-2px)' }} style={{ cursor: 'pointer', padding: '18px 14px', textAlign: 'center', ...optionCardStyle(sel, false) }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: sel ? '#B3B5B7' : '#7F7F7F' }}>{o.sub}</div>
                    <div style={{ fontWeight: 900, fontSize: 16, margin: '5px 0 8px' }}>{o.descricao}</div>
                    <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24 }}>{ofmt(o.odd)}</div>
                  </HoverCard>
                )
              })}
            </div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 7 }}>Descrição do resultado (opcional)</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ex.: Flamengo 2 x 1 Palmeiras" style={{ width: '100%', padding: '13px 15px', border: '1.5px solid #DCDCDC', fontSize: 15, marginBottom: 20 }} />
            <Button onClick={submit} disabled={enviando} style={{ width: '100%', opacity: enviando ? 0.6 : 1 }}>{enviando ? 'Liquidando…' : 'Liquidar apostas'}</Button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px dashed #C8C8C8', padding: 54, textAlign: 'center', color: '#7F7F7F' }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Selecione um evento acima para registrar o resultado.</p>
        </div>
      )}
    </main>
  )
}
