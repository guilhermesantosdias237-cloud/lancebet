// Recuperação de senha (rota /recuperar-senha).
// Porte fiel (visual) de design/lancebet-react/src/pages/Recover.jsx, em duas
// etapas. A lógica mock do AppContext é trocada pelos endpoints reais do
// starter: POST /api/esqueci-senha (envia e-mail com token) e
// POST /api/redefinir-senha (token + nova senha). Por segurança, o backend
// NÃO devolve o token na tela — ele chega por e-mail; o usuário cola o código
// recebido na etapa de redefinição.
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { api, ApiError } from '../../lib/api'
import { toast } from '../../store/uiStore'
import { Button } from '../../components/lancebet/ui'
import type { MensagemResponse } from '../../lib/types'
import iconWhite from '../../assets/icon_white.svg'

const labelStyle: CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 7 }
const inputStyle: CSSProperties = { width: '100%', padding: '14px 15px', border: '1.5px solid #DCDCDC', background: '#fff', fontSize: 15 }
const errorBox: CSSProperties = { background: '#000', color: '#fff', padding: '11px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 16 }

export default function RecuperarSenhaPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const onRequest = async () => {
    if (enviando) return
    setError('')
    if (!email.trim()) {
      setError('Informe seu e-mail cadastrado.')
      return
    }
    setEnviando(true)
    try {
      await api.post<MensagemResponse>('/esqueci-senha', { email: email.trim() })
      toast.info('Se o e-mail estiver cadastrado, você receberá o código de verificação.')
      setStep('reset')
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || 'Não foi possível enviar o código.')
      } else {
        setError('Falha de conexão. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const onReset = async () => {
    if (enviando) return
    setError('')
    if (!token.trim()) {
      setError('Informe o código de verificação enviado por e-mail.')
      return
    }
    if (!senha || senha.length < 6) {
      setError('A nova senha deve ter ao menos 6 caracteres.')
      return
    }
    if (senha !== confirma) {
      setError('As senhas não conferem.')
      return
    }
    setEnviando(true)
    try {
      await api.post<MensagemResponse>('/redefinir-senha', {
        token: token.trim(),
        senha,
        confirmar_senha: confirma,
      })
      toast.sucesso('Senha redefinida com sucesso. Faça login.')
      navigate('/entrar')
    } catch (e) {
      if (e instanceof ApiError) {
        const primeiroCampo = e.errors ? Object.values(e.errors)[0]?.[0] : undefined
        setError(primeiroCampo || e.message || 'Não foi possível redefinir a senha.')
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
          <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 52, lineHeight: 0.95, margin: '0 0 22px' }}>ESQUECEU<br />A SENHA?</h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: '#B3B5B7', maxWidth: '40ch', fontWeight: 500 }}>
            Sem problema. Informe o e-mail da sua conta e enviaremos um código de verificação para você criar uma nova senha.
          </p>
          <div style={{ marginTop: 40, border: '1px solid #222', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', marginBottom: 8 }}>VERIFICAÇÃO POR E-MAIL</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: '#B3B5B7', margin: 0, fontWeight: 500 }}>
              O código de verificação é enviado para o e-mail cadastrado. Copie o código recebido e cole na próxima etapa para definir a nova senha.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {step === 'request' && (
            <div>
              <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 4px' }}>Recuperar acesso</h3>
              <p style={{ fontSize: 13.5, color: '#7F7F7F', margin: '0 0 24px' }}>Informe o e-mail cadastrado.</p>
              <label style={labelStyle}>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joao@email.com" style={{ ...inputStyle, marginBottom: 18 }} onKeyDown={(e) => e.key === 'Enter' && onRequest()} />
              {error && <div style={errorBox}>{error}</div>}
              <Button onClick={onRequest} disabled={enviando} style={{ width: '100%', opacity: enviando ? 0.6 : 1 }}>{enviando ? 'Enviando...' : 'Enviar código de verificação'}</Button>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <Link to="/entrar" style={{ fontSize: 13, fontWeight: 700, color: '#000', borderBottom: '2px solid #000', paddingBottom: 2 }}>← Voltar para o login</Link>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <div>
              <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 4px' }}>Criar nova senha</h3>
              <p style={{ fontSize: 13.5, color: '#7F7F7F', margin: '0 0 20px' }}>Conta: <strong style={{ color: '#000' }}>{email}</strong></p>

              <div style={{ background: '#000', color: '#fff', padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: '#B3B5B7', marginBottom: 5 }}>CÓDIGO ENVIADO POR E-MAIL</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: '#B3B5B7', fontWeight: 500 }}>Verifique sua caixa de entrada (e o spam). Cole abaixo o código de verificação recebido.</div>
              </div>

              <label style={labelStyle}>Código de verificação</label>
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Cole o código recebido" style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={labelStyle}>Nova senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mín. 6 caracteres" style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={labelStyle}>Confirmar nova senha</label>
              <input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="repita a senha" style={{ ...inputStyle, marginBottom: 18 }} onKeyDown={(e) => e.key === 'Enter' && onReset()} />
              {error && <div style={errorBox}>{error}</div>}
              <Button onClick={onReset} disabled={enviando} style={{ width: '100%', opacity: enviando ? 0.6 : 1 }}>{enviando ? 'Redefinindo...' : 'Redefinir senha'}</Button>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <button onClick={() => { setStep('request'); setError(''); }} style={{ background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700, color: '#7F7F7F', cursor: 'pointer' }}>Usar outro e-mail</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
