// Login (rota /entrar). Login dual (e-mail OU CPF) via authStore.login.
// A UI é compartilhada com o cadastro em AuthPage (abas).
import AuthPage from './AuthPage'

export default function LoginPage() {
  return <AuthPage tab="login" />
}
