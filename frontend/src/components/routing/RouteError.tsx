import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import type { CSSProperties } from 'react'
import Icon from '../ui/Icon'

// errorElement da rota raiz: isola crashes de render para que um erro em uma
// página não derrube o app inteiro (white screen).
const btnBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  padding: '12px 20px',
  cursor: 'pointer',
}

export default function RouteError() {
  const error = useRouteError()

  let titulo = 'Algo deu errado'
  let detalhe = 'Ocorreu um erro inesperado ao renderizar esta página.'

  if (isRouteErrorResponse(error)) {
    titulo = `${error.status} ${error.statusText}`
    detalhe = typeof error.data === 'string' ? error.data : detalhe
  } else if (error instanceof Error) {
    detalhe = error.message
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ color: '#cf222e', marginBottom: 16 }}>
        <Icon name="exclamation-triangle-fill" size={72} />
      </div>
      <h2 style={{ marginBottom: 12 }}>{titulo}</h2>
      <p style={{ color: '#7f7f7f', marginBottom: 28 }}>{detalhe}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={{ ...btnBase, background: '#000', color: '#fff' }}>
          <Icon name="house" size={15} /> Início
        </Link>
        <button
          style={{ ...btnBase, background: 'transparent', color: '#000', border: '1.5px solid #000' }}
          onClick={() => window.location.reload()}
        >
          <Icon name="arrow-clockwise" size={15} /> Recarregar
        </button>
      </div>
    </div>
  )
}
