import React, { useState } from 'react';
import logoImg from '../../../img/logo.png';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  Plus,
  Tag,
  Sun,
  Moon,
  Database,
  User,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import { BackupModal } from '../backup/BackupModal';
import { AuthModal } from '../auth/AuthModal';

interface HeaderProps {
  onOpenNewExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewExpense }) => {
  const { theme, toggleTheme, categories, isLoadingData } = useFinance();
  const { user, isConfigured } = useAuth();
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-sm shadow-slate-200/50 dark:shadow-none flex-shrink-0 border border-slate-200/80 dark:border-slate-800 bg-white p-1 flex items-center justify-center">
              <img
                src={logoImg}
                alt="VitaFin Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Vita<span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Fin</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  v0.9
                </span>
                {user && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60" title="Sincronizado com o Supabase">
                    <Cloud className="w-3 h-3 text-blue-500" />
                    Supabase Nuvem
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Controle financeiro inteligente
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Manage Categories Button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              onClick={() => setIsCategoryManagerOpen(true)}
              className="hidden sm:inline-flex hover:border-emerald-300 dark:hover:border-emerald-800"
            >
              Tipos de Gasto ({categories.length})
            </Button>

            {/* Mobile Category icon button */}
            <button
              type="button"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="sm:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              title="Gerenciar Tipos de Gasto"
            >
              <Tag className="w-5 h-5" />
            </button>

            {/* Backup / Data button */}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Backup e Dados Locais"
            >
              <Database className="w-5 h-5" />
            </button>

            {/* Auth / Cloud Sync Account Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                user
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={user ? `Conectado como ${user.email}` : 'Conectar ao Supabase / Entrar'}
            >
              {user ? (
                <>
                  <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold hidden md:inline max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </>
              ) : isConfigured ? (
                <User className="w-5 h-5" />
              ) : (
                <CloudOff className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* New Expense Primary CTA */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenNewExpense}
              isLoading={isLoadingData}
              className="shadow-md shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            >
              <span className="hidden sm:inline">Lançar Gasto</span>
              <span className="sm:hidden">Lançar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Categories Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      {/* Backup and Data Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
