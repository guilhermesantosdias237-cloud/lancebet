// Tela de autenticação do LanceBet (login + cadastro com abas).
// Porte fiel de design/lancebet-react/src/pages/Auth.jsx, trocando o
// AppContext mock por chamadas reais: authStore.login + authApi.cadastrar.
// Reaproveitada por LoginPage (/entrar) e CadastroPage (/cadastro): cada
// rota só define a aba inicial; a alternância entre abas navega entre rotas.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../store/uiStore'
import { authApi, ApiError } from '../../lib/api'
import { cadastroApostadorSchema } from '../../lib/schemas'
import { Perfil } from '../../lib/types'
import { Button } from '../../components/lancebet/ui'
import { tabStyle } from '../../components/lancebet/ui'
import iconWhite from '../../assets/icon_white.svg'

const labelStyle: CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 7 }
const inputStyle: CSSProperties = { width: '100%', padding: '14px 15px', border: '1.5px solid #DCDCDC', background: '#fff', fontSize: 15 }
const smallInput: CSSProperties = { ...inputStyle, padding: '13px 14px', fontSize: 14 }
const errorBox: CSSProperties = { background: '#000', color: '#fff', padding: '11px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }

/** Converte "DD/MM/AAAA" (digitado pelo usuário) para ISO "AAAA-MM-DD". */
function dataParaIso(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim())
  if (!m) return null
  return `${m[3]}-${m[2]}-${m[1]}`
}

interface RegForm {
  nome: string
  email: string
  cpf: string
  nascimento: string
  telefone: string
  senha: string
  aceite: boolean
}

export default function AuthPage({ tab }: { tab: 'login' | 'cadastro' }) {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const setUsuario = useAuthStore((s) => s.setUsuario)

  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [loginForm, setLoginForm] = useState({ id: '', senha: '' })
  const [reg, setReg] = useState<RegForm>({ nome: '', email: '', cpf: '', nascimento: '', telefone: '', senha: '', aceite: false })

  const redirecionarPorPerfil = (perfil: string) =>
    navigate(perfil === Perfil.ADMIN ? '/admin' : '/painel')

  const onLogin = async () => {
    if (enviando) return
    setError('')
    if (!loginForm.id || !loginForm.senha) {
      setError('Informe seu e-mail/CPF e a senha.')
      return
    }
    setEnviando(true)
    try {
      const usuario = await login(loginForm.id.trim(), loginForm.senha)
      toast.sucesso(`Bem-vindo, ${usuario.nome.split(' ')[0]}!`)
      redirecionarPorPerfil(usuario.perfil)
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || 'Credenciais inválidas.')
      } else {
        setError('Falha de conexão. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const onRegister = async () => {
    if (enviando) return
    setError('')

    // Maioridade e validações de forma já no cliente (espelha o protótipo).
    const dataIso = dataParaIso(reg.nascimento)
    if (!dataIso) {
      setError('Use o formato DD/MM/AAAA na data de nascimento.')
      return
    }

    const candidato = {
      nome: reg.nome.trim(),
      email: reg.email.trim(),
      cpf: reg.cpf.trim() || undefined,
      data_nascimento: dataIso,
      senha: reg.senha,
      aceite_termos: reg.aceite,
    }

    const parsed = cadastroApostadorSchema.safeParse(candidato)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Verifique os dados informados.')
      return
    }

    setEnviando(true)
    try {
      const usuario = await authApi.cadastrar(parsed.data)
      // Cadastro já cria a sessão no backend: hidrata o authStore.
      setUsuario(usuario)
      toast.sucesso('Conta criada! R$ 1.000,00 de saldo fictício.')
      navigate('/painel')
    } catch (e) {
      if (e instanceof ApiError) {
        // 422: erros por campo; pega a primeira mensagem disponível.
        const primeiroCampo = e.errors ? Object.values(e.errors)[0]?.[0] : undefined
        setError(primeiroCampo || e.message || 'Não foi possível concluir o cadastro.')
      } else {
        setError('Falha de conexão. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 66px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ background: '#000', color: '#fff', padding: '64px 56px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <img src={iconWhite} alt="" style={{ position: 'absolute', left: -80, bottom: -60, height: 420, opacity: 0.06 }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 52, lineHeight: 0.95, margin: '0 0 22px' }}>ENTRE NO JOGO.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: '#B3B5B7', maxWidth: '40ch', fontWeight: 500 }}>
            Acesse sua conta ou cadastre-se para receber R$ 1.000 em saldo fictício e começar a apostar nos jogos do Brasileirão.
          </p>
          <div style={{ marginTop: 40, border: '1px solid #222', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', marginBottom: 12 }}>PLATAFORMA SIMULADA</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: '#B3B5B7', margin: 0, fontWeight: 500 }}>
              Ambiente acadêmico, sem dinheiro real. O saldo é totalmente fictício e serve apenas para simular apostas.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', border: '1px solid #DCDCDC', background: '#fff', marginBottom: 26 }}>
            <button onClick={() => navigate('/entrar')} style={{ flex: 1, padding: 14, fontWeight: 800, fontSize: 13, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', ...tabStyle(tab === 'login') }}>Entrar</button>
            <button onClick={() => navigate('/cadastro')} style={{ flex: 1, padding: 14, fontWeight: 800, fontSize: 13, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', ...tabStyle(tab === 'cadastro') }}>Criar conta</button>
          </div>

          {tab === 'login' && (
            <div>
              <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 4px' }}>Acessar conta</h3>
              <p style={{ fontSize: 13.5, color: '#7F7F7F', margin: '0 0 24px' }}>Use seu e-mail ou CPF cadastrado.</p>
              <label style={labelStyle}>E-mail ou CPF</label>
              <input value={loginForm.id} onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })} placeholder="joao@email.com" style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={labelStyle}>Senha</label>
              <input type="password" value={loginForm.senha} onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })} placeholder="••••••" style={{ ...inputStyle, marginBottom: 14 }} onKeyDown={(e) => e.key === 'Enter' && onLogin()} />
              <div style={{ textAlign: 'right', marginBottom: 18 }}>
                <Link to="/recuperar-senha" style={{ fontSize: 12.5, fontWeight: 700, color: '#7F7F7F' }}>Esqueci minha senha</Link>
              </div>
              {error && <div style={errorBox}>{error}</div>}
              <Button onClick={onLogin} disabled={enviando} style={{ width: '100%', opacity: enviando ? 0.6 : 1 }}>{enviando ? 'Entrando...' : 'Entrar'}</Button>
            </div>
          )}

          {tab === 'cadastro' && (
            <div>
              <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 4px' }}>Criar conta</h3>
              <p style={{ fontSize: 13.5, color: '#7F7F7F', margin: '0 0 22px' }}>Cadastro exclusivo para maiores de 18 anos.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Nome completo *</label>
                  <input value={reg.nome} onChange={(e) => setReg({ ...reg, nome: e.target.value })} placeholder="Seu nome" style={smallInput} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>E-mail *</label>
                  <input value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="voce@email.com" style={smallInput} />
                </div>
                <div>
                  <label style={labelStyle}>CPF</label>
                  <input value={reg.cpf} onChange={(e) => setReg({ ...reg, cpf: e.target.value })} placeholder="000.000.000-00" style={smallInput} />
                </div>
                <div>
                  <label style={labelStyle}>Nascimento *</label>
                  <input value={reg.nascimento} onChange={(e) => setReg({ ...reg, nascimento: e.target.value })} placeholder="DD/MM/AAAA" style={smallInput} />
                </div>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input value={reg.telefone} onChange={(e) => setReg({ ...reg, telefone: e.target.value })} placeholder="(00) 00000-0000" style={smallInput} />
                </div>
                <div>
                  <label style={labelStyle}>Senha *</label>
                  <input type="password" value={reg.senha} onChange={(e) => setReg({ ...reg, senha: e.target.value })} placeholder="mín. 6 caracteres" style={smallInput} onKeyDown={(e) => e.key === 'Enter' && onRegister()} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, margin: '18px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={reg.aceite} onChange={(e) => setReg({ ...reg, aceite: e.target.checked })} style={{ marginTop: 2, width: 16, height: 16, accentColor: '#000' }} />
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: '#555' }}>
                  Declaro ser maior de 18 anos e aceito os <strong style={{ color: '#000' }}>termos de uso</strong> e a <strong style={{ color: '#000' }}>política de privacidade (LGPD)</strong>.
                </span>
              </label>
              {error && <div style={{ ...errorBox, marginBottom: 14 }}>{error}</div>}
              <Button onClick={onRegister} disabled={enviando} style={{ width: '100%', opacity: enviando ? 0.6 : 1 }}>{enviando ? 'Criando conta...' : 'Criar conta e receber R$ 1.000'}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
