// Helpers de formatação e estilo compartilhados (preto/branco/cinza).

export function fmt(v) {
  const n = Number(v) || 0;
  const neg = n < 0;
  const f = Math.abs(n).toFixed(2);
  const p = f.split('.');
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '- ' : '') + 'R$ ' + p[0] + ',' + p[1];
}

export function ofmt(o) {
  return Number(o).toFixed(2).replace('.', ',');
}

export function now() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, '0');
  return (
    z(d.getDate()) + '/' + z(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes())
  );
}

export const proto = (id) => 'LB-' + String(id).padStart(6, '0');

// ----- estilos derivados de status -----

export function statusStyle(s) {
  if (s === 'ABERTO') return { background: '#000', color: '#fff' };
  if (s === 'FECHADO') return { background: '#fff', border: '1px solid #000', color: '#000' };
  return { background: '#B3B5B7', color: '#fff' };
}

export function statusStyleDark(s) {
  if (s === 'ABERTO') return { background: '#fff', color: '#000' };
  return { background: 'transparent', border: '1px solid rgba(255,255,255,.4)', color: '#fff' };
}

export function pickStyle(sel) {
  return sel
    ? { background: '#000', color: '#fff', border: '1.5px solid #000' }
    : { background: '#fff', color: '#000', border: '1.5px solid #DCDCDC' };
}

export function badgeLabel(b) {
  if (b.status === 'ABERTA') return 'EM ABERTO';
  return b.resultado === 'GANHOU' ? 'GANHOU' : 'PERDEU';
}

export function badgeStyle(b) {
  if (b.status === 'ABERTA') return { background: '#F4F4F4', border: '1px solid #B3B5B7', color: '#000' };
  if (b.resultado === 'GANHOU') return { background: '#000', color: '#fff' };
  return { background: '#fff', border: '1px solid #E4E4E4', color: '#B3B5B7' };
}

export function optionCardStyle(sel, sus) {
  if (sus) return { background: '#F4F4F4', border: '2px dashed #C8C8C8', color: '#B3B5B7' };
  if (sel) return { background: '#000', color: '#fff', border: '2px solid #000' };
  return { background: '#fff', border: '2px solid #E4E4E4' };
}

export function tabStyle(active) {
  return active ? { background: '#000', color: '#fff' } : { background: '#fff', color: '#7F7F7F' };
}

export function filterStyle(active) {
  return active
    ? { background: '#000', color: '#fff', border: '1.5px solid #000' }
    : { background: '#fff', color: '#000', border: '1.5px solid #DCDCDC' };
}
