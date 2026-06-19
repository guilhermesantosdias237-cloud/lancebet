import { createContext, useContext, useState, useCallback, useRef } from 'react';
import seed from '../data/seed.json';
import { now } from '../lib/format.js';

const AppContext = createContext(null);

// Clona o seed para que mutações em runtime não vazem entre reloads de HMR.
const clone = (x) => JSON.parse(JSON.stringify(x));

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => clone(seed.users));
  const [events, setEvents] = useState(() => clone(seed.events));
  const [bets, setBets] = useState(() => clone(seed.bets));
  const [movements, setMovements] = useState(() => clone(seed.movements));
  const [userId, setUserId] = useState(null);
  const [lastBet, setLastBet] = useState(null);
  const [toast, setToast] = useState('');

  const counters = useRef({ ...seed.counters });
  const toastTimer = useRef(null);

  const currentUser = userId ? users.find((u) => u.id === userId) : null;
  const role = currentUser ? currentUser.perfil : 'GUEST';

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  }, []);

  // ---------- AUTENTICAÇÃO ----------

  const login = useCallback(
    (identifier, senha) => {
      const id = (identifier || '').trim().toLowerCase();
      const u = users.find(
        (x) =>
          (x.email.toLowerCase() === id ||
            x.cpf === id ||
            x.cpf.replace(/\D/g, '') === id.replace(/\D/g, '')) &&
          x.senha === senha
      );
      if (!u) return { ok: false, error: 'Credenciais inválidas. Tente joao@email.com / 123456.' };
      if (u.status === 'BLOQUEADO') return { ok: false, error: 'Conta bloqueada. Contate o suporte.' };
      setUserId(u.id);
      showToast('Bem-vindo, ' + u.nome.split(' ')[0] + '!');
      return { ok: true, user: u };
    },
    [users, showToast]
  );

  const register = useCallback(
    (form) => {
      const { nome, email, cpf, nascimento, senha, aceite } = form;
      if (!nome || !email || !senha || !nascimento)
        return { ok: false, error: 'Preencha nome, e-mail, senha e data de nascimento.' };
      if (senha.length < 6) return { ok: false, error: 'A senha deve ter ao menos 6 caracteres.' };
      const m = nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) return { ok: false, error: 'Use o formato DD/MM/AAAA na data de nascimento.' };
      const bd = new Date(+m[3], +m[2] - 1, +m[1]);
      const today = new Date();
      let age = today.getFullYear() - bd.getFullYear();
      const mo = today.getMonth() - bd.getMonth();
      if (mo < 0 || (mo === 0 && today.getDate() < bd.getDate())) age--;
      if (isNaN(age)) return { ok: false, error: 'Data de nascimento inválida.' };
      if (age < 18)
        return { ok: false, error: 'Cadastro permitido apenas para maiores de 18 anos (idade informada: ' + age + ').' };
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
        return { ok: false, error: 'E-mail já cadastrado.' };
      if (!aceite) return { ok: false, error: 'É preciso aceitar os termos e a política de privacidade.' };

      const id = Math.max(...users.map((u) => u.id)) + 1;
      const user = {
        id,
        nome,
        cpf: cpf || '—',
        email,
        senha,
        nascimento,
        perfil: 'APOSTADOR',
        status: 'ATIVO',
        saldo: 1000,
        criadoEm: now().split(' ')[0],
      };
      const mov = {
        id: counters.current.nextMovId++,
        userId: id,
        apostaId: null,
        tipo: 'CRÉDITO INICIAL',
        valor: 1000,
        saldoApos: 1000,
        descricao: 'Saldo fictício de boas-vindas',
        criadoEm: now(),
      };
      setUsers((prev) => [...prev, user]);
      setMovements((prev) => [mov, ...prev]);
      setUserId(id);
      showToast('Conta criada! R$ 1.000,00 de saldo fictício.');
      return { ok: true, user };
    },
    [users, showToast]
  );

  const logout = useCallback(() => {
    setUserId(null);
    showToast('Sessão encerrada.');
  }, [showToast]);

  const loginDemo = useCallback(
    (which) => {
      const u = users.find((x) => (which === 'admin' ? x.perfil === 'ADMINISTRADOR' : x.id === 1));
      if (u) {
        setUserId(u.id);
        showToast(which === 'admin' ? 'Painel administrativo.' : 'Bem-vindo, ' + u.nome.split(' ')[0] + '!');
      }
      return u;
    },
    [users, showToast]
  );

  // ---------- RECUPERAÇÃO DE SENHA (simulada) ----------

  // Verifica se existe conta para o e-mail/CPF e devolve um "token" fictício
  // (em produção seria enviado por e-mail). Aqui é exibido na própria tela.
  const requestPasswordReset = useCallback(
    (identifier) => {
      const id = (identifier || '').trim().toLowerCase();
      if (!id) return { ok: false, error: 'Informe seu e-mail ou CPF.' };
      const u = users.find(
        (x) => x.email.toLowerCase() === id || x.cpf === id || x.cpf.replace(/\D/g, '') === id.replace(/\D/g, '')
      );
      if (!u) return { ok: false, error: 'Nenhuma conta encontrada para este e-mail ou CPF.' };
      if (u.status === 'BLOQUEADO') return { ok: false, error: 'Conta bloqueada. Contate o suporte.' };
      const token = 'LB' + Math.random().toString(36).slice(2, 8).toUpperCase();
      return { ok: true, user: { id: u.id, nome: u.nome, email: u.email }, token };
    },
    [users]
  );

  const resetPassword = useCallback(
    (userId, token, expectedToken, senha, confirma) => {
      if (!token || token.trim().toUpperCase() !== expectedToken)
        return { ok: false, error: 'Código de verificação inválido.' };
      if (!senha || senha.length < 6) return { ok: false, error: 'A nova senha deve ter ao menos 6 caracteres.' };
      if (senha !== confirma) return { ok: false, error: 'As senhas não conferem.' };
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, senha } : u)));
      showToast('Senha redefinida com sucesso. Faça login.');
      return { ok: true };
    },
    [showToast]
  );

  // ---------- APOSTAS ----------

  const placeBet = useCallback(
    (eventId, optionId, stake) => {
      const u = currentUser;
      if (!u) return { ok: false, error: 'Faça login para apostar.', needAuth: true };
      const ev = events.find((e) => e.id === eventId);
      const op = ev && ev.opcoes.find((o) => o.id === optionId);
      if (!op) return { ok: false, error: 'Selecione uma opção.' };
      if (op.status !== 'ATIVA') return { ok: false, error: 'Mercado suspenso.' };
      if (ev.status !== 'ABERTO') return { ok: false, error: 'Apostas encerradas para este evento.' };
      const val = parseFloat(String(stake).replace(',', '.')) || 0;
      if (val <= 0) return { ok: false, error: 'Informe um valor para apostar.' };
      if (val > u.saldo) return { ok: false, error: 'Saldo insuficiente.' };

      const retorno = Math.round(val * op.odd * 100) / 100;
      const saldoApos = Math.round((u.saldo - val) * 100) / 100;
      const bet = {
        id: counters.current.nextBetId++,
        usuarioId: u.id,
        eventoId: ev.id,
        opcaoId: op.id,
        titulo: ev.titulo,
        opcaoDesc: op.descricao,
        valor: val,
        odd: op.odd,
        retorno,
        status: 'ABERTA',
        resultado: 'PENDENTE',
        criadaEm: now(),
        liquidadaEm: null,
      };
      const mov = {
        id: counters.current.nextMovId++,
        userId: u.id,
        apostaId: bet.id,
        tipo: 'APOSTA',
        valor: -val,
        saldoApos,
        descricao: 'Aposta #' + bet.id + ' · ' + ev.titulo,
        criadoEm: now(),
      };
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, saldo: saldoApos } : x)));
      setBets((prev) => [bet, ...prev]);
      setMovements((prev) => [mov, ...prev]);
      setLastBet({ ...bet, saldoApos });
      return { ok: true, bet: { ...bet, saldoApos } };
    },
    [currentUser, events]
  );

  // ---------- ADMIN: EVENTOS ----------

  const setEventStatus = useCallback(
    (id, status) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      showToast('Status do evento: ' + status);
    },
    [showToast]
  );

  const createEvent = useCallback(
    (form) => {
      const { mandante, visitante, competicao, dataFmt, oddM, oddE, oddV } = form;
      if (!mandante || !visitante) return { ok: false, error: 'Informe mandante e visitante.' };
      const m = parseFloat(String(oddM).replace(',', '.')) || 0;
      const e = parseFloat(String(oddE).replace(',', '.')) || 0;
      const v = parseFloat(String(oddV).replace(',', '.')) || 0;
      if (m <= 1 || e <= 1 || v <= 1) return { ok: false, error: 'Todas as odds devem ser maiores que 1,00.' };
      const id = counters.current.nextEventId++;
      const ev = {
        id,
        mandante,
        visitante,
        titulo: mandante + ' x ' + visitante,
        esporte: 'Futebol',
        competicao: competicao || 'Brasileirão Série A',
        dataFmt: dataFmt || 'A definir',
        status: 'ABERTO',
        resultadoDescricao: '',
        criadoPor: currentUser ? currentUser.id : 2,
        opcoes: [
          { id: id * 10 + 1, descricao: mandante, sub: 'Mandante', odd: m, status: 'ATIVA', vencedora: false },
          { id: id * 10 + 2, descricao: 'Empate', sub: 'Empate', odd: e, status: 'ATIVA', vencedora: false },
          { id: id * 10 + 3, descricao: visitante, sub: 'Visitante', odd: v, status: 'ATIVA', vencedora: false },
        ],
      };
      setEvents((prev) => [ev, ...prev]);
      showToast('Evento criado e aberto para apostas.');
      return { ok: true, event: ev };
    },
    [currentUser, showToast]
  );

  // ---------- ADMIN: ODDS / MERCADOS ----------

  const updateOdd = useCallback((evId, optId, value) => {
    const o = parseFloat(String(value).replace(',', '.'));
    setEvents((prev) =>
      prev.map((e) =>
        e.id !== evId
          ? e
          : { ...e, opcoes: e.opcoes.map((op) => (op.id !== optId ? op : { ...op, odd: isNaN(o) ? op.odd : o })) }
      )
    );
  }, []);

  const toggleOption = useCallback((evId, optId) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id !== evId
          ? e
          : {
              ...e,
              opcoes: e.opcoes.map((op) =>
                op.id !== optId ? op : { ...op, status: op.status === 'ATIVA' ? 'SUSPENSA' : 'ATIVA' }
              ),
            }
      )
    );
  }, []);

  const addOption = useCallback(
    (evId, descricao, odd) => {
      const oddN = parseFloat(String(odd).replace(',', '.')) || 0;
      if (!descricao || oddN <= 1) return { ok: false, error: 'Informe descrição e odd maior que 1,00.' };
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== evId) return e;
          const nid = Math.max(0, ...e.opcoes.map((o) => o.id)) + 1;
          return {
            ...e,
            opcoes: [...e.opcoes, { id: nid, descricao, sub: 'Mercado', odd: oddN, status: 'ATIVA', vencedora: false }],
          };
        })
      );
      showToast('Opção adicionada.');
      return { ok: true };
    },
    [showToast]
  );

  // ---------- ADMIN: LIQUIDAÇÃO ----------

  const liquidate = useCallback(
    (evId, winnerOptId, descricao) => {
      if (!evId) return { ok: false, error: 'Selecione um evento.' };
      if (!winnerOptId) return { ok: false, error: 'Selecione a opção vencedora.' };
      const ev = events.find((e) => e.id === evId);
      const desc = descricao || ev.titulo;
      let pagos = 0;
      let nWin = 0;

      const nextUsers = users.map((u) => ({ ...u }));
      const nextMovements = [...movements];
      const nextBets = bets.map((b) => {
        if (b.eventoId !== evId || b.status !== 'ABERTA') return b;
        const ganhou = b.opcaoId === winnerOptId;
        if (ganhou) {
          const u = nextUsers.find((x) => x.id === b.usuarioId);
          if (u) {
            u.saldo = Math.round((u.saldo + b.retorno) * 100) / 100;
            pagos += b.retorno;
            nWin++;
            nextMovements.unshift({
              id: counters.current.nextMovId++,
              userId: u.id,
              apostaId: b.id,
              tipo: 'GANHO',
              valor: b.retorno,
              saldoApos: u.saldo,
              descricao: 'Liquidação aposta #' + b.id + ' · ' + ev.titulo,
              criadoEm: now(),
            });
          }
        }
        return { ...b, status: 'LIQUIDADA', resultado: ganhou ? 'GANHOU' : 'PERDEU', liquidadaEm: now() };
      });
      const nextEvents = events.map((e) =>
        e.id !== evId
          ? e
          : {
              ...e,
              status: 'LIQUIDADO',
              resultadoDescricao: desc,
              opcoes: e.opcoes.map((o) => ({ ...o, vencedora: o.id === winnerOptId })),
            }
      );

      setUsers(nextUsers);
      setMovements(nextMovements);
      setBets(nextBets);
      setEvents(nextEvents);
      showToast('Evento liquidado · ' + nWin + ' aposta(s) paga(s).');
      return { ok: true, nWin, pagos };
    },
    [events, users, bets, movements, showToast]
  );

  const value = {
    users,
    events,
    bets,
    movements,
    currentUser,
    role,
    lastBet,
    toast,
    showToast,
    login,
    register,
    logout,
    loginDemo,
    requestPasswordReset,
    resetPassword,
    placeBet,
    setEventStatus,
    createEvent,
    updateOdd,
    toggleOption,
    addOption,
    liquidate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
