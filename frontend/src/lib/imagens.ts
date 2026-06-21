// Imagens fictícias geradas (Runware) e servidas pelo backend em
// /static/img/seed/. Centraliza os caminhos para que páginas e componentes
// exibam banners e escudos sem duplicar strings.

const BASE = '/static/img/seed'

// Banners (heros cinematográficos).
export const HERO_HOME = `${BASE}/hero_home.png`
export const HERO_EVENTOS = `${BASE}/hero_eventos.png`
export const HERO_PAINEL = `${BASE}/hero_painel.png`

// Escudos genéricos gerados para os clubes do seed (sem replicar marcas reais).
const ESCUDOS = new Set([
  'flamengo',
  'palmeiras',
  'corinthians',
  'saopaulo',
  'gremio',
  'internacional',
  'atleticomg',
  'cruzeiro',
  'botafogo',
  'fluminense',
])

/** Normaliza o nome do time para o slug do arquivo de escudo. */
function slugTime(nome: string): string {
  return (nome || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // remove espaços, hífens, pontos
}

/**
 * Retorna a URL do escudo gerado para o time, ou null quando não há escudo
 * fictício correspondente (ex.: eventos criados manualmente pelo admin).
 */
export function escudoDeTime(nome: string): string | null {
  const slug = slugTime(nome)
  return ESCUDOS.has(slug) ? `${BASE}/escudo_${slug}.png` : null
}
