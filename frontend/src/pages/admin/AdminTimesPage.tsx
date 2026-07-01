// Gerenciar times/participantes (rota /admin/times).
// Lógica: GET /api/admin/times, POST /api/admin/times,
// PUT /api/admin/times/{id}, DELETE /api/admin/times/{id}.
import { useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
import { participantesApi, ApiError } from '../../lib/api'
import { participanteSchema } from '../../lib/schemas'
import type { ParticipanteForm } from '../../lib/schemas'
import type { Participante } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Button } from '../../components/lancebet/ui'
import { toast, useUIStore } from '../../store/uiStore'
import { escudoDeTime } from '../../lib/imagens'

const labelStyle: CSSProperties = { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }
const inputStyle: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid #DCDCDC', fontSize: 14, marginBottom: 13 }

interface FormState {
  nome: string
  esporte: string
  ativo: boolean
}

const emptyForm: FormState = { nome: '', esporte: 'Futebol', ativo: true }

export default function AdminTimesPage() {
  const carregar = useCallback(() => participantesApi.listarAdmin(), [])
  const { data, carregando, erro, recarregar } = useFetch<Participante[]>(carregar, [])
  // `pedirConfirmacao` é método do store, não export standalone (só `toast` é).
  // Mesmo padrão de AdminUsuariosPage/AdminResultadoPage: ler via seletor do hook.
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [enviando, setEnviando] = useState(false)

  const times = data ?? []

  const submit = async () => {
    // Tenta achar o escudo a partir do nome (igual ao usado nos cards do app).
    const escudo = escudoDeTime(form.nome.trim())
    const dto: ParticipanteForm = {
      nome: form.nome.trim(),
      escudo_url: escudo ?? '',
      esporte: form.esporte.trim() || 'Futebol',
      ativo: form.ativo,
    }
    const parsed = participanteSchema.safeParse(dto)
    if (!parsed.success) {
      toast.erro(parsed.error.issues[0]?.message || 'Verifique os dados do time.')
      return
    }
    setEnviando(true)
    try {
      if (editandoId === null) {
        await participantesApi.criar(parsed.data)
        toast.sucesso('Time criado com sucesso.')
      } else {
        await participantesApi.alterar(editandoId, parsed.data)
        toast.sucesso('Time atualizado com sucesso.')
      }
      setForm(emptyForm)
      setEditandoId(null)
      recarregar()
    } catch (e) {
      toast.erro(e instanceof ApiError ? e.message : 'Falha ao salvar o time.')
    } finally {
      setEnviando(false)
    }
  }

  const editar = (p: Participante) => {
    setEditandoId(p.id)
    setForm({ nome: p.nome, esporte: p.esporte, ativo: p.ativo })
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setForm(emptyForm)
  }

  const excluir = (p: Participante) => {
    pedirConfirmacao({
      mensagem: `Excluir o time "${p.nome}"? Esta ação não pode ser desfeita.`,
      tipo: 'danger',
      onConfirmar: async () => {
        try {
          await participantesApi.excluir(p.id)
          toast.sucesso('Time excluído.')
          recarregar()
        } catch (e) {
          toast.erro(e instanceof ApiError ? e.message : 'Falha ao excluir o time.')
        }
      },
    })
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Gerenciar times</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Lista */}
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 0.8fr 1.4fr', gap: 12, padding: '13px 20px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            <div>Time</div><div style={{ textAlign: 'center' }}>Esporte</div><div style={{ textAlign: 'center' }}>Ativo</div><div style={{ textAlign: 'right' }}>Ações</div>
          </div>

          {carregando && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando…</div>}
          {!carregando && erro && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Não foi possível carregar os times.</div>}
          {!carregando && !erro && times.length === 0 && <div style={{ padding: '34px 20px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhum time cadastrado.</div>}

          {times.map((p) => {
            const escudo = p.escudo_url || escudoDeTime(p.nome)
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 0.8fr 1.4fr', gap: 12, padding: '14px 20px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {escudo && <img src={escudo} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />}
                  <span style={{ fontWeight: 900, fontSize: 14 }}>{p.nome}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{p.esporte}</div>
                <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{p.ativo ? 'Sim' : 'Não'}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => editar(p)} style={{ border: '1px solid #DCDCDC', background: '#fff', color: '#000', fontSize: 12, fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => excluir(p)} style={{ border: '1px solid #000', background: '#000', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}>Excluir</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Formulário */}
        <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
          <div style={{ background: '#000', color: '#fff', padding: '14px 20px', fontWeight: 800, fontSize: 13, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            {editandoId === null ? 'Cadastrar time' : 'Editar time'}
          </div>
          <div style={{ padding: '22px 20px' }}>
            <label style={labelStyle}>Nome</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Santos" style={inputStyle} />
            <label style={labelStyle}>Esporte</label>
            <input value={form.esporte} onChange={(e) => setForm({ ...form, esporte: e.target.value })} placeholder="Futebol" style={inputStyle} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 18, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              Ativo
            </label>
            <Button onClick={submit} disabled={enviando} style={{ width: '100%', padding: 14, fontSize: 13, opacity: enviando ? 0.6 : 1 }}>
              {enviando ? 'Salvando…' : editandoId === null ? 'Criar time' : 'Salvar alterações'}
            </Button>
            {editandoId !== null && (
              <button onClick={cancelarEdicao} style={{ width: '100%', marginTop: 10, padding: 12, fontSize: 12, fontWeight: 700, background: '#fff', border: '1px solid #DCDCDC', cursor: 'pointer' }}>
                Cancelar edição
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}