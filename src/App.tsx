import React from 'react';
import { AppModuleProvider, useAppModule } from './context/AppModuleContext';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { InvestmentProvider } from './context/InvestmentContext';
import { InvestmentDashboard } from './components/investment/InvestmentDashboard';
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
            <strong>VitaFin</strong> — Gestão Financeira Inteligente & Controle de Gastos e Receitas
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Sincronizado na nuvem (Supabase) e com suporte offline local.
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

// Componente que escolhe qual dashboard renderizar
const DashboardSelector: React.FC = () => {
  const { currentModule } = useAppModule();

  if (currentModule === 'vitainvest') {
    return <InvestmentDashboard />;
  }

  return <FinanceDashboard />;
};

export default function App() {
  return (
    <AppModuleProvider>
      <AuthProvider>
        <FinanceProvider>
          <InvestmentProvider>
            <DashboardSelector />
          </InvestmentProvider>
        </FinanceProvider>
      </AuthProvider>
    </AppModuleProvider>
  );
}
