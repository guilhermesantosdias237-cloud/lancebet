import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { Button } from '../components/ui.jsx';
import { tabStyle } from '../lib/format.js';
import iconWhite from '../assets/icon_white.svg';

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#555', marginBottom: 7 };
const inputStyle = { width: '100%', padding: '14px 15px', border: '1.5px solid #DCDCDC', background: '#fff', fontSize: 15 };
const smallInput = { ...inputStyle, padding: '13px 14px', fontSize: 14 };
const errorBox = { background: '#000', color: '#fff', padding: '11px 14px', fontSize: 12.5, fontWeight: 600, marginBottom: 16 };

export default function Auth({ tab: initialTab = 'login' }) {
  const { login, register, loginDemo } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ id: '', senha: '' });
  const [reg, setReg] = useState({ nome: '', email: '', cpf: '', nascimento: '', telefone: '', senha: '', aceite: false });

  useEffect(() => {
    setTab(initialTab);
    setError('');
  }, [initialTab]);

  const onLogin = () => {
    const res = login(loginForm.id, loginForm.senha);
    if (!res.ok) return setError(res.error);
    navigate(res.user.perfil === 'ADMINISTRADOR' ? '/admin' : '/painel');
  };
  const onRegister = () => {
    const res = register(reg);
    if (!res.ok) return setError(res.error);
    navigate('/painel');
  };
  const demo = (which) => {
    const u = loginDemo(which);
    navigate(which === 'admin' ? '/admin' : '/painel');
    return u;
  };

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
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', marginBottom: 12 }}>CONTAS DE DEMONSTRAÇÃO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="light" onClick={() => demo('apostador')} style={{ padding: '13px 16px', fontSize: 13, textAlign: 'left' }}>Entrar como Apostador →</Button>
              <Button variant="ghostDark" onClick={() => demo('admin')} style={{ padding: '13px 16px', fontSize: 13, textAlign: 'left' }}>Entrar como Administrador →</Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', border: '1px solid #DCDCDC', background: '#fff', marginBottom: 26 }}>
            <button onClick={() => { setTab('login'); setError(''); }} style={{ flex: 1, padding: 14, fontWeight: 800, fontSize: 13, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', ...tabStyle(tab === 'login') }}>Entrar</button>
            <button onClick={() => { setTab('cadastro'); setError(''); }} style={{ flex: 1, padding: 14, fontWeight: 800, fontSize: 13, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', ...tabStyle(tab === 'cadastro') }}>Criar conta</button>
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
              <Button onClick={onLogin} style={{ width: '100%' }}>Entrar</Button>
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
                  <input type="password" value={reg.senha} onChange={(e) => setReg({ ...reg, senha: e.target.value })} placeholder="mín. 6 caracteres" style={smallInput} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, margin: '18px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={reg.aceite} onChange={(e) => setReg({ ...reg, aceite: e.target.checked })} style={{ marginTop: 2, width: 16, height: 16, accentColor: '#000' }} />
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: '#555' }}>
                  Declaro ser maior de 18 anos e aceito os <strong style={{ color: '#000' }}>termos de uso</strong> e a <strong style={{ color: '#000' }}>política de privacidade (LGPD)</strong>.
                </span>
              </label>
              {error && <div style={{ ...errorBox, marginBottom: 14 }}>{error}</div>}
              <Button onClick={onRegister} style={{ width: '100%' }}>Criar conta e receber R$ 1.000</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
