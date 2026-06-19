import { useNavigate, Link, useLocation } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { fmt } from '../lib/format.js';
import iconWhite from '../assets/icon_white.svg';
import nameWhite from '../assets/name_white.svg';

function NavLink({ to, children }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      style={{
        color: '#fff',
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        padding: '8px 12px',
        opacity: active ? 1 : 0.72,
      }}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { currentUser, role, logout } = useApp();
  const navigate = useNavigate();

  const goLanding = () => {
    if (!currentUser) navigate('/');
    else navigate(role === 'ADMINISTRADOR' ? '/admin' : '/painel');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#000', color: '#fff', borderBottom: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', height: 66, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 26 }}>
        <div onClick={goLanding} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
          <img src={iconWhite} alt="" style={{ height: 32, display: 'block' }} />
          <img src={nameWhite} alt="LANCE.BET" style={{ height: 15, display: 'block' }} />
        </div>

        {!currentUser && (
          <>
            <nav style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
              <NavLink to="/">Início</NavLink>
              <NavLink to="/regras">Regras &amp; LGPD</NavLink>
            </nav>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link to="/entrar" style={{ border: '1.5px solid rgba(255,255,255,.35)', color: '#fff', fontWeight: 700, fontSize: 12.5, letterSpacing: '.05em', textTransform: 'uppercase', padding: '9px 17px' }}>
                Entrar
              </Link>
              <Link to="/cadastro" style={{ background: '#fff', color: '#000', fontWeight: 800, fontSize: 12.5, letterSpacing: '.05em', textTransform: 'uppercase', padding: '10px 18px' }}>
                Criar conta
              </Link>
            </div>
          </>
        )}

        {role === 'APOSTADOR' && (
          <>
            <nav style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
              <NavLink to="/painel">Painel</NavLink>
              <NavLink to="/eventos">Apostar</NavLink>
              <NavLink to="/minhas-apostas">Minhas apostas</NavLink>
              <NavLink to="/carteira">Carteira</NavLink>
              <NavLink to="/regras">Regras</NavLink>
            </nav>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div onClick={() => navigate('/carteira')} style={{ background: '#fff', color: '#000', padding: '7px 15px', cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', color: '#7F7F7F' }}>SALDO FICTÍCIO</span>
                <span style={{ fontSize: 15, fontWeight: 900 }}>{fmt(currentUser.saldo)}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{currentUser.nome.split(' ')[0]}</span>
              <button onClick={logout} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 13px', cursor: 'pointer' }}>
                Sair
              </button>
            </div>
          </>
        )}

        {role === 'ADMINISTRADOR' && (
          <>
            <span style={{ marginLeft: 2, background: '#fff', color: '#000', fontSize: 10, fontWeight: 900, letterSpacing: '.12em', padding: '4px 8px' }}>ADMIN</span>
            <nav style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
              <NavLink to="/admin">Painel</NavLink>
              <NavLink to="/admin/eventos">Eventos</NavLink>
              <NavLink to="/admin/odds">Odds</NavLink>
              <NavLink to="/admin/resultados">Resultados</NavLink>
              <NavLink to="/admin/usuarios">Usuários</NavLink>
            </nav>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{currentUser.nome}</span>
              <button onClick={logout} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', padding: '8px 13px', cursor: 'pointer' }}>
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
