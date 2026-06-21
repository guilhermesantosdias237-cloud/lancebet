// Cadastro de apostador (rota /cadastro). Usa cadastroApostadorSchema +
// authApi.cadastrar. A UI é compartilhada com o login em AuthPage (abas).
import AuthPage from './AuthPage'

export default function CadastroPage() {
  return <AuthPage tab="cadastro" />
}
