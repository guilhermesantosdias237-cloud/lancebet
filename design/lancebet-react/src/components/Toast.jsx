import { useApp } from '../context/AppContext.jsx';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 26,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#000',
        color: '#fff',
        padding: '15px 26px',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '.02em',
        zIndex: 200,
        animation: 'lbfade .25s ease',
        boxShadow: '0 8px 30px rgba(0,0,0,.25)',
      }}
    >
      {toast}
    </div>
  );
}
