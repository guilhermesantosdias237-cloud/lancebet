const section = { marginBottom: 34 };
const h2 = { fontFamily: "'Alfa Slab One', serif", fontSize: 24, margin: '0 0 12px', borderBottom: '2px solid #000', paddingBottom: 8 };
const p = { fontSize: 15, lineHeight: 1.65, color: '#333', margin: 0 };

export default function Rules() {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 28px 72px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7F7F7F', textTransform: 'uppercase' }}>Documentos da plataforma</div>
      <h1 style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 46, margin: '8px 0 36px' }}>Regras &amp; LGPD</h1>

      <div style={{ background: '#000', color: '#fff', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 38, border: '3px solid #fff', padding: '4px 12px', lineHeight: 1 }}>18+</div>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: '#B3B5B7', margin: 0, fontWeight: 500 }}>
          O acesso e o uso da LANCE.BET são permitidos <strong style={{ color: '#fff' }}>exclusivamente a maiores de 18 anos</strong>. Esta é uma plataforma simulada, sem dinheiro real e sem qualquer valor monetário.
        </p>
      </div>

      <section style={section}>
        <h2 style={h2}>1 · Funcionamento das apostas</h2>
        <p style={{ ...p, marginBottom: 10 }}>
          Cada usuário recebe um saldo fictício de boas-vindas de R$ 1.000,00 ao se cadastrar. As apostas são simples: o usuário escolhe um evento, seleciona uma opção de mercado (mandante, empate ou visitante) e define o valor a apostar.
        </p>
        <p style={p}>
          O retorno potencial é calculado multiplicando o valor apostado pela odd registrada no momento da confirmação. A odd permanece fixa após a aposta, mesmo que seja alterada posteriormente pelo administrador.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>2 · Liquidação e resultados</h2>
        <p style={p}>
          Após o término do evento, o administrador registra o resultado oficial e marca a opção vencedora. O sistema então liquida automaticamente todas as apostas: as vencedoras têm o retorno potencial creditado no saldo fictício; as perdedoras são encerradas sem crédito. Apostas só podem ser feitas enquanto o evento estiver com status <strong>ABERTO</strong>.
        </p>
      </section>

      <section style={section}>
        <h2 style={h2}>3 · Jogo responsável</h2>
        <p style={p}>
          Embora não envolva dinheiro real, a LANCE.BET reforça a importância do jogo consciente. Apostas devem ser encaradas como entretenimento. Em um produto real, recomendamos definir limites e buscar ajuda caso o jogo deixe de ser diversão.
        </p>
      </section>

      <section>
        <h2 style={h2}>4 · Privacidade &amp; LGPD</h2>
        <p style={{ ...p, marginBottom: 10 }}>
          Coletamos apenas os dados necessários para identificar o apostador: nome, e-mail, CPF e data de nascimento. A data de nascimento é usada exclusivamente para validar a maioridade.
        </p>
        <p style={p}>
          Nenhum dado é compartilhado com terceiros. O usuário pode solicitar a exclusão de sua conta e dos seus dados a qualquer momento, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </section>
    </main>
  );
}
