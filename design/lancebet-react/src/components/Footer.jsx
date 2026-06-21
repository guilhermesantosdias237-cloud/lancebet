import { useNavigate } from 'react-router';
import iconWhite from '../assets/icon_white.svg';
import nameWhite from '../assets/name_white.svg';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <section style={{ background: '#000', color: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 46, border: '3px solid #fff', padding: '6px 16px', lineHeight: 1 }}>18+</div>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: '#B3B5B7', maxWidth: '48ch', margin: 0, fontWeight: 500 }}>
              Plataforma exclusivamente para maiores de 18 anos. Aposte com responsabilidade — este é um ambiente{' '}
              <strong style={{ color: '#fff' }}>simulado, sem dinheiro real</strong>.
            </p>
          </div>
          <button onClick={() => navigate('/regras')} style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', padding: '15px 26px', fontWeight: 800, fontSize: 13, letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Regras &amp; jogo responsável
          </button>
        </div>
      </section>
      <footer style={{ background: '#000', color: '#7F7F7F', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '30px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.7 }}>
            <img src={iconWhite} alt="" style={{ height: 24, display: 'block' }} />
            <img src={nameWhite} alt="LANCE.BET" style={{ height: 12, display: 'block' }} />
          </div>
          <span style={{ fontSize: 12, letterSpacing: '.04em' }}>© 2026 LANCE.BET · Projeto acadêmico · Ambiente simulado sem valor monetário.</span>
        </div>
      </footer>
    </>
  );
}
