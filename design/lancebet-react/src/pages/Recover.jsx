import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { Button } from '../components/ui.jsx';
import iconWhite from '../assets/icon_white.svg';

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 7 };
const inputStyle = { width: '100%', padding: '14px 15px', border: '1.5px solid #DCDCDC', background: '#fff', fontSize: 15 };
const errorBox = { background: '#000', color: '#fff', padding: '11px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 16 };

export default function Recover() {
  const { requestPasswordReset, resetPassword } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [identifier, setIdentifier] = useState('');
  const [target, setTarget] = useState(null); // { id, nome, email }
  const [expectedToken, setExpectedToken] = useState('');
  const [token, setToken] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [error, setError] = useState('');

  const onRequest = () => {
    const res = requestPasswordReset(identifier);
    if (!res.ok) return setError(res.error);
    setTarget(res.user);
    setExpectedToken(res.token);
    setToken('');
    setError('');
    setStep('reset');
  };

  const onReset = () => {
    const res = resetPassword(target.id, token, expectedToken, senha, confirma);
    if (!res.ok) return setError(res.error);
    navigate('/entrar');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 66px)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ background: '#000', color: '#fff', padding: '64px 56px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <img src={iconWhite} alt="" style={{ position: 'absolute', left: -80, bottom: -60, height: 420, opacity: 0.06 }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 52, lineHeight: 0.95, margin: '0 0 22px' }}>ESQUECEU<br />A SENHA?</h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: '#B3B5B7', maxWidth: '40ch', fontWeight: 500 }}>
            Sem problema. Informe o e-mail ou CPF da sua conta e geramos um código de verificação para você criar uma nova senha.
          </p>
          <div style={{ marginTop: 40, border: '1px solid #222', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', marginBottom: 8 }}>AMBIENTE SIMULADO</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: '#B3B5B7', margin: 0, fontWeight: 500 }}>
              Em produção, o código seria enviado por e-mail/SMS. Aqui ele é exibido na tela para fins de demonstração.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {step === 'request' && (
            <div>
              <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 4px' }}>Recuperar acesso</h3>
              <p style={{ fontSize: 13.5, color: '#7F7F7F', margin: '0 0 24px' }}>Informe o e-mail ou CPF cadastrado.</p>
              <label style={labelStyle}>E-mail ou CPF</label>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="joao@email.com" style={{ ...inputStyle, marginBottom: 18 }} onKeyDown={(e) => e.key === 'Enter' && onRequest()} />
              {error && <div style={errorBox}>{error}</div>}
              <Button onClick={onRequest} style={{ width: '100%' }}>Enviar código de verificação</Button>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <Link to="/entrar" style={{ fontSize: 13, fontWeight: 700, color: '#000', borderBottom: '2px solid #000', paddingBottom: 2 }}>← Voltar para o login</Link>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <div>
              <h3 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 28, margin: '0 0 4px' }}>Criar nova senha</h3>
              <p style={{ fontSize: 13.5, color: '#7F7F7F', margin: '0 0 20px' }}>Conta: <strong style={{ color: '#000' }}>{target?.email}</strong></p>

              <div style={{ background: '#000', color: '#fff', padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: '#B3B5B7', marginBottom: 5 }}>SEU CÓDIGO DE VERIFICAÇÃO (SIMULADO)</div>
                <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 24, letterSpacing: '.08em' }}>{expectedToken}</div>
              </div>

              <label style={labelStyle}>Código de verificação</label>
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Digite o código acima" style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={labelStyle}>Nova senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mín. 6 caracteres" style={{ ...inputStyle, marginBottom: 16 }} />
              <label style={labelStyle}>Confirmar nova senha</label>
              <input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="repita a senha" style={{ ...inputStyle, marginBottom: 18 }} onKeyDown={(e) => e.key === 'Enter' && onReset()} />
              {error && <div style={errorBox}>{error}</div>}
              <Button onClick={onReset} style={{ width: '100%' }}>Redefinir senha</Button>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <button onClick={() => { setStep('request'); setError(''); }} style={{ background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700, color: '#7F7F7F', cursor: 'pointer' }}>Usar outro e-mail/CPF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
