// Usuários & apostas (rota /admin/usuarios).
// Porte fiel de design/lancebet-react/src/pages/admin/AdminUsers.jsx.
// Lógica: GET /api/admin/usuarios, GET /api/admin/apostas,
// PATCH /api/admin/usuarios/{id}/status (bloquear/desbloquear).
import { useCallback } from 'react'
import type { CSSProperties } from 'react'
import { adminApi, ApiError } from '../../lib/api'
import type { UsuarioAdmin, Aposta, PaginaResponse } from '../../lib/types'
import { Perfil, StatusUsuario } from '../../lib/types'
import { useFetch } from '../../hooks/useFetch'
import { Badge, apostaBadgeLabel, apostaBadgeStyle } from '../../components/lancebet/ui'
import { toast, useUIStore } from '../../store/uiStore'
import { fmt, ofmt } from '../../lib/format'

export default function AdminUsuariosPage() {
  const carregarUsuarios = useCallback(() => adminApi.listarUsuarios({ por_pagina: 100 }), [])
  const carregarApostas = useCallback(() => adminApi.listarApostas({ por_pagina: 100 }), [])
  const { data: usuariosPag, carregando: carregandoUsuarios, recarregar: recarregarUsuarios } = useFetch<PaginaResponse<UsuarioAdmin>>(carregarUsuarios, [])
  const { data: apostasPag, carregando: carregandoApostas } = useFetch<PaginaResponse<Aposta>>(carregarApostas, [])
  const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)

  const usuarios = usuariosPag?.items ?? []
  const apostas = apostasPag?.items ?? []

  const alternarStatus = (u: UsuarioAdmin) => {
    const bloqueando = u.status !== StatusUsuario.BLOQUEADO
    const novo = bloqueando ? StatusUsuario.BLOQUEADO : StatusUsuario.ATIVO
    pedirConfirmacao({
      titulo: bloqueando ? 'Bloquear usuário' : 'Desbloquear usuário',
      mensagem: bloqueando
        ? `Bloquear o acesso de "${u.nome}"? Ele não poderá mais entrar nem apostar.`
        : `Desbloquear "${u.nome}" e restaurar o acesso?`,
      textoConfirmar: bloqueando ? 'Bloquear' : 'Desbloquear',
      tipo: bloqueando ? 'danger' : 'warning',
      onConfirmar: async () => {
        try {
          await adminApi.alterarStatusUsuario(u.id, novo)
          toast.sucesso(bloqueando ? 'Usuário bloqueado.' : 'Usuário desbloqueado.')
          recarregarUsuarios()
        } catch (e) {
          toast.erro(e instanceof ApiError ? e.message : 'Falha ao alterar status do usuário.')
        }
      },
    })
  }

  const statusBadgeStyle = (status: string): CSSProperties =>
    status === StatusUsuario.BLOQUEADO
      ? { background: '#fff', border: '1px solid #000', color: '#000' }
      : { background: '#000', color: '#fff' }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Usuários &amp; apostas</h1>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24, margin: '0 0 14px' }}>Usuários cadastrados</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4', marginBottom: 38 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 0.8fr 1.2fr', gap: 12, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
          <div>Nome</div><div>E-mail</div><div>Perfil</div><div style={{ textAlign: 'right' }}>Saldo</div><div style={{ textAlign: 'center' }}>Apostas</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>

        {carregandoUsuarios && <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando…</div>}
        {!carregandoUsuarios && usuarios.length === 0 && <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhum usuário cadastrado.</div>}

        {usuarios.map((u) => {
          const admin = u.perfil === Perfil.ADMIN
          return (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 0.8fr 1.2fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>{u.nome}</div>
              <div style={{ fontSize: 12.5, color: '#7F7F7F', fontWeight: 600 }}>{u.email}</div>
              <div><span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.05em', border: '1px solid #DCDCDC', padding: '3px 7px', textTransform: 'uppercase' }}>{u.perfil}</span></div>
              <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5 }}>{fmt(u.saldo_ficticio)}</div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 13.5 }}>{u.total_apostas}</div>
              <div style={{ textAlign: 'right' }}>
                {admin ? (
                  <Badge style={{ fontSize: 9.5, padding: '3px 9px', ...statusBadgeStyle(u.status) }}>{u.status}</Badge>
                ) : (
                  <button
                    onClick={() => alternarStatus(u)}
                    title={u.status === StatusUsuario.BLOQUEADO ? 'Desbloquear' : 'Bloquear'}
                    style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.06em', padding: '4px 10px', textTransform: 'uppercase', cursor: 'pointer', ...statusBadgeStyle(u.status) }}
                  >
                    {u.status}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24, margin: '0 0 14px' }}>Histórico geral de apostas</h2>
      <div style={{ background: '#fff', border: '1px solid #E4E4E4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 1fr 0.8fr 1fr 1.1fr', gap: 12, padding: '13px 22px', background: '#000', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>
          <div>Usuário</div><div>Evento · palpite</div><div style={{ textAlign: 'right' }}>Valor</div><div style={{ textAlign: 'right' }}>Odd</div><div style={{ textAlign: 'right' }}>Retorno</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>

        {carregandoApostas && <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Carregando…</div>}
        {!carregandoApostas && apostas.length === 0 && <div style={{ padding: '34px 22px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600, fontSize: 13 }}>Nenhuma aposta registrada.</div>}

        {apostas.map((b) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.8fr 1fr 0.8fr 1fr 1.1fr', gap: 12, padding: '14px 22px', borderBottom: '1px solid #F0F0F0', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{b.nome_usuario || '—'}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{b.titulo_evento} <span style={{ color: '#7F7F7F' }}>· {b.descricao_opcao}</span></div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13 }}>{fmt(b.valor_apostado)}</div>
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13 }}>{ofmt(b.odd_registrada)}</div>
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{fmt(b.retorno_potencial)}</div>
            <div style={{ textAlign: 'right' }}><Badge style={{ fontSize: 9.5, padding: '4px 9px', ...apostaBadgeStyle(b) }}>{apostaBadgeLabel(b)}</Badge></div>
          </div>
        ))}
      </div>
    </main>
  )
}
