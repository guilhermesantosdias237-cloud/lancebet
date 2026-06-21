// Badges portados de templates/macros/badges.html (mesmas cores).

function cls(cor: string) {
  return `badge bg-${cor}`
}

export function StatusChamadoBadge({ status }: { status: string }) {
  const cor =
    status === 'Aberto'
      ? 'primary'
      : status === 'Em Análise'
        ? 'info'
        : status === 'Resolvido'
          ? 'success'
          : 'secondary'
  return <span className={cls(cor)}>{status}</span>
}

export function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const cor =
    prioridade === 'Urgente'
      ? 'danger'
      : prioridade === 'Alta'
        ? 'warning text-dark'
        : prioridade === 'Média'
          ? 'info'
          : 'secondary'
  return <span className={cls(cor)}>{prioridade}</span>
}

export function PerfilBadge({ perfil }: { perfil: string }) {
  const cor =
    perfil === 'Administrador' ? 'danger' : perfil === 'Vendedor' ? 'warning text-dark' : 'info'
  return <span className={cls(cor)}>{perfil}</span>
}

export function StatusPagamentoBadge({ status }: { status: string }) {
  const cor =
    status === 'Aprovado'
      ? 'success'
      : status === 'Pendente'
        ? 'warning text-dark'
        : status === 'Em Processamento'
          ? 'primary'
          : status === 'Recusado'
            ? 'danger'
            : status === 'Reembolsado'
              ? 'info'
              : 'secondary'
  return <span className={cls(cor)}>{status}</span>
}

export function MensagensNaoLidasBadge({ count }: { count: number }) {
  if (!count || count <= 0) return null
  return (
    <span className="badge bg-warning text-dark">
      <i className="bi bi-envelope-fill" /> {count} não lida{count > 1 ? 's' : ''}
    </span>
  )
}

export function Badge({
  texto,
  cor = 'secondary',
  icon,
}: {
  texto: string
  cor?: string
  icon?: string
}) {
  return (
    <span className={cls(cor)}>
      {icon && <i className={`bi bi-${icon}`} />} {texto}
    </span>
  )
}

// =====================================================================
// Badges de domínio do LanceBet — estética inline preto/branco/cinza do
// protótipo (sem classes Bootstrap, para casar com o restante do design).
// =====================================================================
import type { CSSProperties } from 'react'
import {
  StatusEvento,
  StatusAposta,
  ResultadoAposta,
  StatusOpcao,
  StatusUsuario,
} from '../../lib/types'

const baseLb: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 800,
  letterSpacing: '.06em',
  padding: '4px 9px',
  textTransform: 'uppercase',
  display: 'inline-block',
}

function LbBadge({ style, children }: { style: CSSProperties; children: string }) {
  return <span style={{ ...baseLb, ...style }}>{children}</span>
}

export function StatusEventoBadge({ status }: { status: string }) {
  const style: CSSProperties =
    status === StatusEvento.ABERTO
      ? { background: '#000', color: '#fff' }
      : status === StatusEvento.FECHADO
        ? { background: '#fff', border: '1px solid #000', color: '#000' }
        : { background: '#B3B5B7', color: '#fff' }
  return <LbBadge style={style}>{status}</LbBadge>
}

export function StatusApostaBadge({ status }: { status: string }) {
  const style: CSSProperties =
    status === StatusAposta.ABERTA
      ? { background: '#F4F4F4', border: '1px solid #B3B5B7', color: '#000' }
      : { background: '#000', color: '#fff' }
  return <LbBadge style={style}>{status}</LbBadge>
}

export function ResultadoApostaBadge({ resultado }: { resultado: string }) {
  const style: CSSProperties =
    resultado === ResultadoAposta.GANHOU
      ? { background: '#000', color: '#fff' }
      : resultado === ResultadoAposta.PERDEU
        ? { background: '#fff', border: '1px solid #E4E4E4', color: '#B3B5B7' }
        : { background: '#F4F4F4', border: '1px solid #B3B5B7', color: '#000' }
  return <LbBadge style={style}>{resultado}</LbBadge>
}

export function StatusOpcaoBadge({ status }: { status: string }) {
  const style: CSSProperties =
    status === StatusOpcao.ATIVA
      ? { background: '#000', color: '#fff' }
      : { background: '#F4F4F4', border: '1px dashed #C8C8C8', color: '#B3B5B7' }
  return <LbBadge style={style}>{status}</LbBadge>
}

export function StatusUsuarioBadge({ status }: { status: string }) {
  const style: CSSProperties =
    status === StatusUsuario.ATIVO
      ? { background: '#000', color: '#fff' }
      : { background: '#fff', border: '1px solid #000', color: '#000' }
  return <LbBadge style={style}>{status}</LbBadge>
}
