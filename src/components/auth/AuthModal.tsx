import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  Cloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isConfigured, signIn, signUp, signOut, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(
            error.message.includes('Invalid login')
              ? 'E-mail ou senha incorretos.'
              : error.message
          );
        } else {
          setSuccessMsg('Login realizado com sucesso!');
          setTimeout(() => {
            handleClose();
          }, 800);
        }
      } else if (mode === 'register') {
        const { error, needsEmailConfirmation } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          if (needsEmailConfirmation) {
            setSuccessMsg('Conta criada! Enviamos um link de confirmação para seu e-mail.');
          } else {
            setSuccessMsg('Conta criada com sucesso e conectada!');
            setTimeout(() => {
              handleClose();
            }, 1000);
          }
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Enviamos as instruções de recuperação para o seu e-mail.');
        }
      }
    } catch {
      setErrorMsg('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        user
          ? 'Minha Conta VitaFin'
          : mode === 'login'
          ? 'Entrar no VitaFin'
          : mode === 'register'
          ? 'Criar Nova Conta'
          : 'Recuperar Senha'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Se o Supabase não estiver configurado no .env */}
        {!isConfigured && !user && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Chaves do Supabase não configuradas no .env</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Para sincronizar com seu banco de dados na nuvem, adicione suas credenciais no arquivo{' '}
              <code className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 rounded font-mono">.env</code>:
            </p>
            <div className="bg-amber-100/80 dark:bg-slate-900 p-2.5 rounded-xl text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto space-y-1">
              <div>VITE_SUPABASE_URL=https://seu-projeto.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=sua-chave-anon</div>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-500">
              💡 Não se preocupe! Enquanto isso, seus gastos continuam salvos com segurança no seu navegador.
            </p>
          </div>
        )}

        {/* Usuário já autenticado */}
        {user ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3.5 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
                {user.email?.slice(0, 2).toUpperCase() || 'VF'}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                    Sincronização em Nuvem Ativa
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.email}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Seus gastos e categorias estão salvos e sincronizados com o Supabase.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoading}
              >
                Sair da Conta
              </Button>
            </div>
          </div>
        ) : (
          /* Formulário de Login / Cadastro / Recuperação */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensagem de Erro */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Campo E-mail */}
            <div className="relative">
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-[38px]" />
            </div>

            {/* Campo Senha */}
            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  label="Senha"
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-[38px]" />
              </div>
            )}

            {/* Confirmar Senha no Cadastro */}
            {mode === 'register' && (
              <div className="relative">
                <Input
                  label="Confirmar Senha"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  disabled={isLoading}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-[38px]" />
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-md shadow-emerald-600/20"
              icon={
                mode === 'login' ? (
                  <LogIn className="w-4 h-4" />
                ) : mode === 'register' ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )
              }
            >
              {mode === 'login'
                ? 'Entrar no VitaFin'
                : mode === 'register'
                ? 'Cadastrar Minha Conta'
                : 'Enviar Link de Recuperação'}
            </Button>

            {/* Alternadores de modo */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              {mode === 'login' && (
                <>
                  <div>
                    Ainda não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline underline-offset-2"
                    >
                      Cadastre-se gratuitamente
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                </>
              )}

              {mode === 'register' && (
                <div>
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline underline-offset-2"
                  >
                    Fazer login
                  </button>
                </div>
              )}

              {mode === 'forgot' && (
                <div>
                  Lembrou a senha?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline underline-offset-2"
                  >
                    Voltar para o login
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
