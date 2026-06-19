// Meu perfil (rota /perfil) — disponível para qualquer usuário autenticado
// (apostador e administrador). Estilo LanceBet, consome os endpoints já
// existentes: GET/PUT /api/usuario/perfil, PUT /api/usuario/senha, PUT
// /api/usuario/foto. Sem dependência de Bootstrap (inline, como as páginas admin).
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { z } from 'zod'
import { api, ApiError } from '../../lib/api'
import { senhaSchema } from '../../lib/schemas'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../store/uiStore'
import { formatarData, fmt } from '../../lib/format'
import { Button } from '../../components/lancebet/ui'
import { Perfil } from '../../lib/types'
import type { Usuario } from '../../lib/types'

const labelStyle: CSSProperties = { display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#555', marginBottom: 6 }
const inputStyle: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid #DCDCDC', fontSize: 14, marginBottom: 4 }
const cardStyle: CSSProperties = { background: '#fff', border: '1px solid #E4E4E4' }
const cardHeader: CSSProperties = { background: '#000', color: '#fff', padding: '14px 20px', fontWeight: 800, fontSize: 13, letterSpacing: '.07em', textTransform: 'uppercase' }
const erroStyle: CSSProperties = { color: '#C00', fontSize: 11, fontWeight: 600, margin: '2px 0 11px' }

const FOTO_FALLBACK = '/static/img/user.jpg'
const FOTO_MAX_BYTES = 10 * 1024 * 1024
const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const perfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(4, 'O nome deve ter no mínimo 4 caracteres.')
    .max(128, 'O nome deve ter no máximo 128 caracteres.')
    .refine((v) => v.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome.'),
  email: z.string().trim().email('E-mail inválido.'),
})

const trocaSenhaSchema = z
  .object({
    senha_atual: z.string().min(1, 'Informe a senha atual.'),
    senha_nova: senhaSchema,
    confirmar_senha: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((d) => d.senha_nova === d.confirmar_senha, {
    message: 'As senhas não coincidem.',
    path: ['confirmar_senha'],
  })

function lerComoBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.readAsDataURL(arquivo)
  })
}

function Campo({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement> & { erro?: string }) {
  const { erro, ...inputProps } = rest as React.InputHTMLAttributes<HTMLInputElement> & { erro?: string }
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input {...inputProps} style={inputStyle} />
      {erro ? <div style={erroStyle}>{erro}</div> : <div style={{ height: 13 }} />}
    </div>
  )
}

export default function PerfilPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const setUsuario = useAuthStore((s) => s.setUsuario)
  const inputFoto = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(usuario?.nome ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [errosPerfil, setErrosPerfil] = useState<Record<string, string[]>>({})
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errosSenha, setErrosSenha] = useState<Record<string, string[]>>({})
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  const [enviandoFoto, setEnviandoFoto] = useState(false)

  // GET/PUT /usuario/perfil e /usuario/foto respondem UsuarioResponse, que NÃO
  // carrega saldo_ficticio (esse campo só vem em /me, /login, /cadastrar). Ao
  // gravar esses payloads direto no store, o saldo seria zerado no header e no
  // perfil. Preservamos o saldo já presente no store.
  const aplicarUsuario = (u: Usuario) => {
    const atual = useAuthStore.getState().usuario
    setUsuario({ ...u, saldo_ficticio: atual?.saldo_ficticio ?? u.saldo_ficticio })
  }

  // Busca dados frescos do servidor (reflete alterações feitas em outra aba).
  useEffect(() => {
    api.get<Usuario>('/usuario/perfil').then((u) => {
      aplicarUsuario(u)
      setNome(u.nome)
      setEmail(u.email)
    }).catch(() => {})
  }, [setUsuario])

  if (!usuario) return null

  const ep = (c: string) => errosPerfil[c]?.[0]
  const es = (c: string) => errosSenha[c]?.[0]

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setErrosPerfil({})
    const parsed = perfilSchema.safeParse({ nome, email })
    if (!parsed.success) {
      setErrosPerfil(parsed.error.flatten().fieldErrors)
      return
    }
    setSalvandoPerfil(true)
    try {
      const atualizado = await api.put<Usuario>('/usuario/perfil', parsed.data)
      aplicarUsuario(atualizado)
      toast.sucesso('Perfil atualizado com sucesso.')
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrosPerfil(err.errors)
      else if (err instanceof ApiError) toast.erro(err.message)
      else toast.erro((err as Error).message)
    } finally {
      setSalvandoPerfil(false)
    }
  }

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault()
    setErrosSenha({})
    const parsed = trocaSenhaSchema.safeParse({ senha_atual: senhaAtual, senha_nova: senhaNova, confirmar_senha: confirmar })
    if (!parsed.success) {
      setErrosSenha(parsed.error.flatten().fieldErrors)
      return
    }
    setSalvandoSenha(true)
    try {
      await api.put('/usuario/senha', parsed.data)
      toast.sucesso('Senha alterada com sucesso.')
      setSenhaAtual('')
      setSenhaNova('')
      setConfirmar('')
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrosSenha(err.errors)
      else if (err instanceof ApiError) toast.erro(err.message)
      else toast.erro((err as Error).message)
    } finally {
      setSalvandoSenha(false)
    }
  }

  async function aoSelecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    if (!FOTO_TIPOS.includes(arquivo.type)) {
      toast.erro('Formato inválido. Use JPG, PNG, GIF ou WEBP.')
      return
    }
    if (arquivo.size > FOTO_MAX_BYTES) {
      toast.erro('Imagem muito grande. O tamanho máximo é 10MB.')
      return
    }
    setEnviandoFoto(true)
    try {
      const foto_base64 = await lerComoBase64(arquivo)
      const atualizado = await api.put<Usuario>('/usuario/foto', { foto_base64 })
      aplicarUsuario(atualizado)
      toast.sucesso('Foto atualizada com sucesso.')
    } catch (err) {
      if (err instanceof ApiError) toast.erro(err.message)
      else toast.erro((err as Error).message)
    } finally {
      setEnviandoFoto(false)
    }
  }

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '38px 28px 64px' }}>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 42, margin: '0 0 26px' }}>Meu perfil</h1>

      {/* Identidade + foto */}
      <div style={{ ...cardStyle, padding: '22px 24px', display: 'flex', gap: 22, alignItems: 'center', marginBottom: 22 }}>
        <img
          src={usuario.foto_url}
          alt="Foto de perfil"
          width={92}
          height={92}
          style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #000', flexShrink: 0 }}
          onError={(ev) => { const i = ev.currentTarget; if (!i.src.endsWith(FOTO_FALLBACK)) i.src = FOTO_FALLBACK }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>{usuario.nome}</div>
          <div style={{ fontSize: 13, color: '#7F7F7F', fontWeight: 600, marginTop: 2 }}>{usuario.email}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.05em', border: '1px solid #000', padding: '3px 8px', textTransform: 'uppercase' }}>{usuario.perfil}</span>
            {usuario.perfil === Perfil.APOSTADOR && (
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.05em', border: '1px solid #DCDCDC', padding: '3px 8px', textTransform: 'uppercase', color: '#555' }}>Saldo {fmt(usuario.saldo_ficticio)}</span>
            )}
            {usuario.data_cadastro && (
              <span style={{ fontSize: 11.5, color: '#7F7F7F', fontWeight: 600 }}>Membro desde {formatarData(usuario.data_cadastro)}</span>
            )}
          </div>
        </div>
        <Button variant="outline" disabled={enviandoFoto} onClick={() => inputFoto.current?.click()} style={{ padding: '11px 16px', fontSize: 11.5, alignSelf: 'center', whiteSpace: 'nowrap', opacity: enviandoFoto ? 0.6 : 1 }}>
          {enviandoFoto ? 'Enviando…' : 'Alterar foto'}
        </Button>
        <input ref={inputFoto} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" style={{ display: 'none' }} onChange={aoSelecionarFoto} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
        {/* Dados da conta */}
        <form onSubmit={salvarPerfil} style={cardStyle}>
          <div style={cardHeader}>Dados da conta</div>
          <div style={{ padding: '22px 20px' }}>
            <Campo label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={128} erro={ep('nome')} autoComplete="name" />
            <Campo label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} erro={ep('email')} autoComplete="email" />
            <Campo label="Perfil de acesso" value={usuario.perfil} disabled readOnly />
            <Button type="submit" disabled={salvandoPerfil} style={{ width: '100%', padding: 14, fontSize: 13, marginTop: 4, opacity: salvandoPerfil ? 0.6 : 1 }}>
              {salvandoPerfil ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>

        {/* Alterar senha */}
        <form onSubmit={alterarSenha} autoComplete="off" style={cardStyle}>
          <div style={cardHeader}>Alterar senha</div>
          <div style={{ padding: '22px 20px' }}>
            <Campo label="Senha atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} erro={es('senha_atual')} autoComplete="current-password" />
            <Campo label="Nova senha" type="password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} erro={es('senha_nova')} autoComplete="new-password" />
            <Campo label="Confirmar nova senha" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} erro={es('confirmar_senha')} autoComplete="new-password" />
            <div style={{ fontSize: 11, color: '#7F7F7F', fontWeight: 600, margin: '0 0 14px', lineHeight: 1.5 }}>
              Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.
            </div>
            <Button type="submit" disabled={salvandoSenha} style={{ width: '100%', padding: 14, fontSize: 13, opacity: salvandoSenha ? 0.6 : 1 }}>
              {salvandoSenha ? 'Alterando…' : 'Alterar senha'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
