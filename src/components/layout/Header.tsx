import React, { useState } from 'react';
import logoImgFin from '../../../img/logo.png';
import logoImgInvest from '../../../img/logo2.png';
import { useAppModule } from '../../context/AppModuleContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  Plus,
  Tag,
  Sun,
  Moon,
  User,
  Cloud,
  CloudOff,
  ChevronDown,
} from 'lucide-react';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import { AuthModal } from '../auth/AuthModal';

interface HeaderProps {
  onOpenNewExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewExpense }) => {
  const { currentModule, setModule, moduleConfig } = useAppModule();
  const { theme, toggleTheme, categories, isLoadingData } = useFinance();
  const { user, isConfigured } = useAuth();
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState(false);

  // Escolher logo baseado no módulo
  const logoImg = currentModule === 'vitainvest' ? logoImgInvest : logoImgFin;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-sm flex-shrink-0 border border-slate-200/80 dark:border-slate-800 bg-white p-0.5 sm:p-1 flex items-center justify-center">
              <img
                src={logoImg}
                alt={`${moduleConfig.name} Logo`}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {/* Module Selector Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModuleSelectorOpen(!isModuleSelectorOpen)}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity focus:outline-none"
                  >
                    <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                      Vita<span className={`bg-gradient-to-r ${moduleConfig.gradient} bg-clip-text text-transparent`}>{moduleConfig.shortName}</span>
                    </h1>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                  </button>

                  {/* Module Selector Dropdown */}
                  {isModuleSelectorOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
                        onClick={() => setIsModuleSelectorOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-2 z-50 w-72 max-w-[90vw] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setModule('vitafin');
                            setIsModuleSelectorOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors ${
                            currentModule === 'vitafin' ? 'bg-emerald-50/80 dark:bg-emerald-950/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0 p-0.5">
                              <img
                                src={logoImgFin}
                                alt="VitaFin"
                                className="w-full h-full object-contain rounded-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                VitaFin
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                Gestão de gastos
                              </div>
                            </div>
                            {currentModule === 'vitafin' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">✓</span>
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setModule('vitainvest');
                            setIsModuleSelectorOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors ${
                            currentModule === 'vitainvest' ? 'bg-blue-50/80 dark:bg-blue-950/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0 p-0.5">
                              <img
                                src={logoImgInvest}
                                alt="VitaInvest"
                                className="w-full h-full object-contain rounded-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                VitaInvest
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                Gestão de investimentos
                              </div>
                            </div>
                            {currentModule === 'vitainvest' && (
                              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">✓</span>
                            )}
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-${moduleConfig.accentColor}-50 dark:bg-${moduleConfig.accentColor}-950/60 text-${moduleConfig.accentColor}-600 dark:text-${moduleConfig.accentColor}-400 border border-${moduleConfig.accentColor}-200/60 dark:border-${moduleConfig.accentColor}-800/60`}>
                  v1.0
                </span>
                {user && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60" title="Sincronizado com o Supabase">
                    <Cloud className="w-3 h-3 text-blue-500" />
                    Supabase Nuvem
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {moduleConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            {/* Manage Categories Button (Desktop) */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Tag className={`w-4 h-4 text-${moduleConfig.accentColor}-600 dark:text-${moduleConfig.accentColor}-400`} />}
              onClick={() => setIsCategoryManagerOpen(true)}
              className={`hidden sm:inline-flex hover:border-${moduleConfig.accentColor}-300 dark:hover:border-${moduleConfig.accentColor}-800`}
            >
              {moduleConfig.terminology.categories} ({categories.length})
            </Button>

            {/* Mobile Category icon button */}
            <button
              type="button"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="sm:hidden w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={`Gerenciar ${moduleConfig.terminology.categories}`}
            >
              <Tag className="w-4 h-4" />
            </button>

            {/* Auth / Cloud Sync Account Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`h-8 px-2 sm:h-9 sm:px-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                user
                  ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={user ? `Conectado como ${user.email}` : 'Conectar ao Supabase / Entrar'}
            >
              {user ? (
                <>
                  <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold hidden md:inline max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </>
              ) : isConfigured ? (
                <User className="w-4 h-4" />
              ) : (
                <CloudOff className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* New Expense Primary CTA (Header) */}
            <Button
              type="button"
              variant={currentModule === 'vitainvest' ? 'primary' : 'success'}
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenNewExpense}
              isLoading={isLoadingData}
              className={
                currentModule === 'vitainvest'
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-600/25 focus:ring-blue-500 text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 font-semibold'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/25 focus:ring-emerald-500 text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 font-semibold'
              }
            >
              <span>{moduleConfig.terminology.newExpense}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Categories Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
