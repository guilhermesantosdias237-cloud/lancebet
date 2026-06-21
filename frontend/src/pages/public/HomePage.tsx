// Landing page pública do LanceBet (rota /).
// Porte fiel de design/lancebet-react/src/pages/Home.jsx.
// A lista de eventos em destaque vem do backend via eventosApi.listar
// (status=Aberto, por_pagina=3) em vez do AppContext mock do protótipo.
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { eventosApi } from '../../lib/api'
import { StatusEvento } from '../../lib/types'
import EventCard from '../../components/lancebet/EventCard'
import Footer from '../../components/lancebet/Footer'
import { Button } from '../../components/lancebet/ui'
import Spinner from '../../components/ui/Spinner'
import iconWhite from '../../assets/icon_white.svg'

const steps = [
  { n: '01', t: 'Crie sua conta', d: 'Cadastro rápido com validação de maioridade pela data de nascimento.' },
  { n: '02', t: 'Ganhe R$ 1.000', d: 'Saldo fictício de boas-vindas para apostar sem usar dinheiro real.' },
  { n: '03', t: 'Faça sua aposta', d: 'Escolha um jogo, selecione o mercado e confirme com o valor desejado.' },
  { n: '04', t: 'Acompanhe o resultado', d: 'Apostas liquidadas automaticamente e saldo atualizado na hora.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { data, carregando } = useFetch(
    () => eventosApi.listar({ status: StatusEvento.ABERTO, por_pagina: 3 }),
    [],
  )
  const featured = data?.items ?? []

  return (
    <div>
      <section style={{ background: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <img src={iconWhite} alt="" style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', height: 560, opacity: 0.06, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 28px 76px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: '1px solid rgba(255,255,255,.25)', padding: '7px 14px', marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, background: '#fff', borderRadius: '50%' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', color: '#B3B5B7' }}>PLATAFORMA SIMULADA · SALDO FICTÍCIO</span>
          </div>
          <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 88, lineHeight: 0.92, letterSpacing: '-.01em', margin: 0, maxWidth: '14ch' }}>O JOGO COMEÇA NO SEU PALPITE.</h1>
          <p style={{ fontSize: 19, lineHeight: 1.5, color: '#B3B5B7', maxWidth: '52ch', margin: '28px 0 38px', fontWeight: 500 }}>
            Aposte em jogos do Brasileirão com saldo fictício, acompanhe odds em tempo real e veja suas apostas serem liquidadas automaticamente. Sem dinheiro real, só estratégia.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Button variant="light" onClick={() => navigate('/cadastro')} style={{ padding: '17px 32px', fontSize: 15 }}>Criar conta grátis</Button>
            <Button variant="ghostDark" onClick={() => navigate('/entrar')} style={{ padding: '17px 32px', fontSize: 15 }}>Entrar</Button>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
            {([['R$ 1.000', 'Saldo de boas-vindas'], ['100%', 'Ambiente simulado'], ['18+', 'Maiores de idade']] as const).map(([big, small], i) => (
              <div key={i} style={{ display: 'flex', gap: 40 }}>
                {i > 0 && <div style={{ width: 1, background: '#222' }} />}
                <div>
                  <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34 }}>{big}</div>
                  <div style={{ fontSize: 12, color: '#7F7F7F', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 4 }}>{small}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
          <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, margin: 0 }}>Jogos em destaque</h2>
          <button onClick={() => navigate('/entrar')} style={{ background: 'transparent', border: 'none', color: '#000', fontWeight: 700, fontSize: 13, letterSpacing: '.04em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: '2px solid #000', paddingBottom: 3 }}>Ver todos os eventos →</button>
        </div>
        {carregando ? (
          <Spinner />
        ) : featured.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #E4E4E4', padding: '40px 28px', textAlign: 'center', color: '#7F7F7F', fontWeight: 600 }}>
            Nenhum jogo aberto no momento. Volte em breve.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {featured.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </section>

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 28px 72px' }}>
        <h2 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 34, margin: '0 0 30px' }}>Como funciona</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#E4E4E4', border: '1px solid #E4E4E4' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ background: '#fff', padding: '28px 24px' }}>
              <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 30, color: '#B3B5B7' }}>{s.n}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: '12px 0 7px' }}>{s.t}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#7F7F7F', margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
