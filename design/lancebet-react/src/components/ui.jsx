import { useState } from 'react';

// Botão com suporte a hover via JS (mantém estética inline do design).
export function Button({ variant = 'primary', style, hoverStyle, children, ...props }) {
  const [hover, setHover] = useState(false);
  const base = {
    border: 'none',
    cursor: 'pointer',
    fontWeight: 800,
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    padding: '16px',
    fontSize: 14,
  };
  const variants = {
    primary: { background: '#000', color: '#fff' },
    primaryHover: { background: '#7F7F7F' },
    light: { background: '#fff', color: '#000' },
    lightHover: { background: '#B3B5B7' },
    outline: { background: 'transparent', color: '#000', border: '1.5px solid #000' },
    outlineHover: { background: '#F4F4F4' },
    ghostDark: { background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)' },
    ghostDarkHover: { borderColor: '#fff' },
  };
  const v = variants[variant] || variants.primary;
  const vh = variants[variant + 'Hover'] || {};
  return (
    <button
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...v, ...style, ...(hover ? { ...vh, ...hoverStyle } : {}) }}
    >
      {children}
    </button>
  );
}

export function Badge({ style, children }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '.06em',
        padding: '5px 10px',
        textTransform: 'uppercase',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Card de hover genérico (borda escurece no hover).
export function HoverCard({ style, hoverStyle = { borderColor: '#000' }, children, ...props }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transition: 'border-color .15s, transform .12s', ...style, ...(hover ? hoverStyle : {}) }}
    >
      {children}
    </div>
  );
}
