import React, { useState } from 'react';
import { AppModuleProvider, useAppModule } from './context/AppModuleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { InvestmentProvider } from './context/InvestmentContext';
import { PadProvider, usePad } from './context/PadContext';
import { InvestmentDashboard } from './components/investment/InvestmentDashboard';
import { PadDashboard } from './components/pad/PadDashboard';
import { Header } from './components/layout/Header';
import { MonthSelector } from './components/layout/MonthSelector';
import { MetricCards } from './components/dashboard/MetricCards';
import { CategoryPieChart } from './components/dashboard/CategoryPieChart';
import { DailyBarChart } from './components/dashboard/DailyBarChart';
import { ExpenseList } from './components/expenses/ExpenseList';
import { ExpenseFormModal } from './components/expenses/ExpenseFormModal';
import { BudgetModal } from './components/budget/BudgetModal';
import { CategoryManagerModal } from './components/categories/CategoryManagerModal';
import { TransactionType } from './types/finance';
import { Input } from './components/common/Input';
import { AlertCircle, CheckCircle2, Loader2, TrendingUp, PieChart, DollarSign, Wallet, LineChart, BarChart3, Coins, AreaChart, ArrowUpRight } from 'lucide-react';
import logoImgFin from '../img/logo.png';
import logoImgInvest from '../img/logo2.png';
import logoImgPad from '../img/logo3.png';

// ─── Background Animado de Finanças ──────────────────────────────────────────
const FinanceAnimatedBackground: React.FC = () => {
  const [mouse, setMouse] = React.useState({ x: 50, y: 50 });
  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  const floatingIcons = [
    { Icon: TrendingUp,  size: 32, x: '7%',  y: '14%', delay: 0,   duration: 18, color: 'text-emerald-500/20 dark:text-emerald-400/20' },
    { Icon: DollarSign,  size: 28, x: '85%', y: '11%', delay: 2,   duration: 22, color: 'text-amber-500/15 dark:text-amber-300/15' },
    { Icon: PieChart,    size: 36, x: '78%', y: '68%', delay: 4,   duration: 20, color: 'text-emerald-500/15 dark:text-emerald-300/15' },
    { Icon: Wallet,      size: 26, x: '10%', y: '74%', delay: 1,   duration: 24, color: 'text-blue-500/20 dark:text-blue-300/20' },
    { Icon: LineChart,   size: 40, x: '88%', y: '6%',  delay: 3,   duration: 19, color: 'text-blue-500/10 dark:text-blue-300/10' },
    { Icon: BarChart3,   size: 30, x: '92%', y: '55%', delay: 5,   duration: 21, color: 'text-amber-500/20 dark:text-amber-400/20' },
    { Icon: Coins,       size: 24, x: '28%', y: '88%', delay: 2.5, duration: 23, color: 'text-amber-500/15 dark:text-amber-300/15' },
    { Icon: ArrowUpRight, size: 22, x: '65%', y: '48%', delay: 6,   duration: 25, color: 'text-emerald-500/15 dark:text-emerald-400/15' },
    { Icon: AreaChart,   size: 26, x: '18%', y: '35%', delay: 3.5, duration: 17, color: 'text-blue-500/15 dark:text-blue-300/15' },
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Mouse-follow glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-transform duration-75 ease-out z-0"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(59,130,246,0.12) 60%, transparent 100%)',
          left: `calc(${mouse.x}% - 300px)`,
          top: `calc(${mouse.y}% - 300px)`,
        }}
      />

      <div className="absolute w-[500px] h-[500px] -top-40 -left-40 bg-emerald-500/[0.08] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute w-[400px] h-[400px] -bottom-32 -right-32 bg-blue-500/[0.08] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '3s' }} />
      {/* Ticker Tape no Topo (Estilo Bolsa de Valores) */}
      <div className="absolute top-4 left-0 right-0 overflow-hidden opacity-40 dark:opacity-50 whitespace-nowrap pointer-events-none select-none text-[10px] font-mono tracking-wider">
        <div className="inline-block ticker-continuo" style={{ minWidth: '200%' }}>
          <span className="text-emerald-500 font-bold">▲ IBOV +1.42%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ S&amp;P 500 +0.85%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ USD/BRL -0.32%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ BTC +3.12%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ PETR4 +2.10%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ VALE3 -0.45%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ FIIs IFIX +0.18%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ CDI 10.50%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ TESOURO SELIC +0.02%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ IBOV +1.42%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ USD/BRL -0.32%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ BTC +3.12%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ PETR4 +2.10%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ VALE3 -0.45%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ FIIs IFIX +0.18%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ CDI 10.50%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ TESOURO SELIC +0.02%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ IBOV +1.42%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ S&amp;P 500 +0.85%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ USD/BRL -0.32%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ BTC +3.12%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ PETR4 +2.10%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ VALE3 -0.45%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ FIIs IFIX +0.18%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ CDI 10.50%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ TESOURO SELIC +0.02%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ IBOV +1.42%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ USD/BRL -0.32%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ IBOV +1.42%</span> &nbsp; • &nbsp;
          <span className="text-rose-500 font-bold">▼ S&amp;P 500 -0.15%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ BTC +3.12%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ IBOV +1.42%</span> &nbsp; • &nbsp;
          <span className="text-emerald-500 font-bold">▲ S&amp;P 500 +0.85%</span> &nbsp; • &nbsp;
        </div>
      </div>

      {/* Floating Candlestick / Market Chart Decorativo */}
      <div className="absolute top-1/3 -left-12 opacity-15 dark:opacity-20 hidden md:flex items-end gap-1.5 h-32 pointer-events-none">
        {[
          { h: '60%', c: 'bg-emerald-500' },
          { h: '85%', c: 'bg-emerald-500' },
          { h: '45%', c: 'bg-rose-500' },
          { h: '70%', c: 'bg-emerald-500' },
          { h: '95%', c: 'bg-emerald-500' },
        ].map((candle, idx) => (
          <div key={idx} className="flex flex-col items-center justify-end h-full w-2">
            <div className={`w-0.5 h-full ${candle.c} opacity-40`} />
            <div className={`w-2.5 rounded-sm ${candle.c}`} style={{ height: candle.h }} />
            <div className={`w-0.5 h-4 ${candle.c} opacity-40`} />
          </div>
        ))}
      </div>

      <div className="absolute top-1/4 -right-8 opacity-15 dark:opacity-20 hidden md:flex items-end gap-1.5 h-32 pointer-events-none">
        {[
          { h: '50%', c: 'bg-emerald-500' },
          { h: '75%', c: 'bg-emerald-500' },
          { h: '90%', c: 'bg-emerald-500' },
          { h: '60%', c: 'bg-rose-500' },
          { h: '100%', c: 'bg-emerald-500' },
        ].map((candle, idx) => (
          <div key={idx} className="flex flex-col items-center justify-end h-full w-2">
            <div className={`w-0.5 h-full ${candle.c} opacity-40`} />
            <div className={`w-2.5 rounded-sm ${candle.c}`} style={{ height: candle.h }} />
            <div className={`w-0.5 h-4 ${candle.c} opacity-40`} />
          </div>
        ))}
      </div>

      {floatingIcons.map((item, i) => (
        <div
          key={i}
          className={`absolute ${item.color}`}
          style={{ left: item.x, top: item.y, animation: `loginFloat ${item.duration}s ease-in-out ${item.delay}s infinite`, transition: 'transform 0.35s ease-out' }}
          data-icon
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px) scale(1.25)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
        >
          <item.Icon size={item.size} strokeWidth={1.2} />
        </div>
      ))}
    </div>
  );
};

// ─── Tela de Login / Cadastro ────────────────────────────────────────────────
const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }
    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(
            error.message.includes('Invalid login') || error.message.includes('invalid_credentials')
              ? 'E-mail ou senha incorretos.'
              : error.message
          );
        }
      } else if (mode === 'register') {
        const { error, needsEmailConfirmation } = await signUp(email, password);
        if (error) setErrorMsg(error.message);
        else
          setSuccessMsg(
            needsEmailConfirmation
              ? 'Conta criada! Confirme seu e-mail para entrar.'
              : 'Conta criada com sucesso!'
          );
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Instruções de recuperação enviadas para o seu e-mail.');
      }
    } catch {
      setErrorMsg('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FinanceAnimatedBackground />

      {/* Card central */}
      <div className="w-full max-w-md">

        {/* Header com logos */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            {[logoImgFin, logoImgInvest, logoImgPad].map((logo, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 flex items-center justify-center"
              >
                <img src={logo} alt="logo" className="w-full h-full object-contain rounded-xl" />
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Vita<span className="text-emerald-500">O</span><span className="text-blue-500">n</span><span className="text-amber-500">e</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Organize o presente. Invista no futuro.
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-5">

          {/* Abas Login / Cadastro */}
          {mode !== 'forgot' && (
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recuperar Senha</p>
              <p className="text-xs text-slate-500 mt-0.5">Enviaremos um link para seu e-mail</p>
            </div>
          )}

          {/* Aviso Supabase não configurado */}
          {!isConfigured && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Supabase não configurado. Configure o arquivo <code className="px-1 bg-amber-100 dark:bg-amber-900 rounded">.env</code> para usar o login.</span>
            </div>
          )}

          {/* Feedback */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
            />

            {mode !== 'forgot' && (
              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
            )}

            {mode === 'register' && (
              <Input
                label="Confirmar Senha"
                type="password"
                required
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                disabled={isLoading}
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Enviar Link'}
            </button>
          </form>

          {/* Link "Esqueceu a senha" */}
          {mode === 'login' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 dark:text-emerald-400 underline underline-offset-2"
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── Dashboards ───────────────────────────────────────────────────────────────
const FinanceDashboard: React.FC = () => {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [modalDefaultType, setModalDefaultType] = React.useState<TransactionType>('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

  const handleOpenNewModal = (type: TransactionType = 'expense') => {
    setModalDefaultType(type);
    setIsExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col transition-colors">
      <Header onOpenNewExpense={() => handleOpenNewModal('expense')} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-3.5 sm:space-y-6">
        <MonthSelector />
        <MetricCards onOpenBudgetModal={() => setIsBudgetModalOpen(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-stretch">
          <div className="lg:col-span-6 h-full">
            <CategoryPieChart />
          </div>
          <div className="lg:col-span-6 h-full">
            <DailyBarChart />
          </div>
        </div>

        <ExpenseList onOpenNewExpense={handleOpenNewModal} />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-5 sm:py-6 mt-8 sm:mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>VitaFin</strong> — Gestão Financeira Inteligente &amp; Controle de Gastos e Receitas
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Sincronizado na nuvem
          </p>
        </div>
      </footer>

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        defaultType={modalDefaultType}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

const PadView: React.FC = () => {
  const { openNewNote } = usePad();

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col transition-colors">
      <Header onOpenNewExpense={openNewNote} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <PadDashboard />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-5 sm:py-6 mt-8 sm:mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>VitaPad</strong> — Seus Blocos de Anotações Inteligentes
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Sincronizado na nuvem
          </p>
        </div>
      </footer>
    </div>
  );
};

// ─── Seletor de módulo (só renderiza se autenticado) ─────────────────────────
const DashboardSelector: React.FC = () => {
  const { currentModule } = useAppModule();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  if (currentModule === 'vitainvest') return <InvestmentDashboard />;
  if (currentModule === 'vitapad') return <PadView />;
  return <FinanceDashboard />;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppModuleProvider>
      <AuthProvider>
        <FinanceProvider>
          <InvestmentProvider>
            <PadProvider>
              <DashboardSelector />
            </PadProvider>
          </InvestmentProvider>
        </FinanceProvider>
      </AuthProvider>
    </AppModuleProvider>
  );
}
