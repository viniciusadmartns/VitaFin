import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  ArrowUpRight,
} from 'lucide-react';

interface MetricCardsProps {
  onOpenBudgetModal: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onOpenBudgetModal }) => {
  const { stats } = useFinance();

  const isNetPositive = stats.netBalance >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Entradas de Valores (Receitas) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            Entradas (Receitas)
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight truncate">
            {formatCurrency(stats.totalIncome)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {stats.incomeCount} {stats.incomeCount === 1 ? 'entrada registrada' : 'entradas registradas'}
          </p>
        </div>
      </div>

      {/* 2. Saídas do Mês (Despesas) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500 w-full" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            Saídas (Despesas)
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
            {formatCurrency(stats.totalExpenses)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {stats.expenseCount} {stats.expenseCount === 1 ? 'despesa' : 'despesas'} • Média {formatCurrency(stats.averagePerDay)}/dia
          </p>
        </div>
      </div>

      {/* 3. Orçamento / Meta Mensal */}
      <div
        onClick={onOpenBudgetModal}
        className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500/60 transition-all flex flex-col justify-between"
        title="Clique para definir ou alterar o orçamento de gastos deste mês"
      >
        <div
          className={`absolute top-0 left-0 h-1 w-full ${
            stats.budgetUsedPercentage !== null && stats.budgetUsedPercentage > 100
              ? 'bg-rose-500'
              : stats.budgetUsedPercentage !== null && stats.budgetUsedPercentage > 80
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-purple-500 to-indigo-500'
          }`}
        />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
            Meta / Orçamento
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="space-y-1.5">
          {stats.budget ? (
            <>
              <div className="flex items-baseline justify-between gap-1">
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
                  {formatCurrency(stats.budget)}
                </h3>
                <span
                  className={`text-[10px] sm:text-xs font-bold flex-shrink-0 ${
                    (stats.budgetUsedPercentage || 0) > 100
                      ? 'text-rose-600 dark:text-rose-400'
                      : (stats.budgetUsedPercentage || 0) > 80
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {(stats.budgetUsedPercentage || 0).toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (stats.budgetUsedPercentage || 0) > 100
                      ? 'bg-rose-500'
                      : (stats.budgetUsedPercentage || 0) > 80
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(stats.budgetUsedPercentage || 0, 100)}%` }}
                />
              </div>

              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="truncate">
                  {(stats.remainingBudget || 0) >= 0 ? 'Resta: ' : 'Passou: '}
                  <strong className={(stats.remainingBudget || 0) < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                    {formatCurrency(Math.abs(stats.remainingBudget || 0))}
                  </strong>
                </span>
                <span className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex-shrink-0 pl-1">
                  Ajustar
                </span>
              </p>
            </>
          ) : (
            <div className="py-0.5">
              <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                Definir <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
                Definir limite mensal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Dinheiro Salvo (Saldo / Economia) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col justify-between">
        <div
          className={`absolute top-0 left-0 h-1 w-full ${
            isNetPositive
              ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500'
              : 'bg-gradient-to-r from-rose-500 to-amber-500'
          }`}
        />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            Dinheiro Salvo
          </span>
          <div
            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isNetPositive
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <h3
            className={`text-lg sm:text-2xl lg:text-3xl font-black tabular-nums tracking-tight truncate ${
              isNetPositive
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isNetPositive ? '+ ' : '- '}
            {formatCurrency(Math.abs(stats.netBalance))}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
            {stats.totalIncome > 0 ? (
              isNetPositive ? (
                <>
                  <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] sm:text-[10px]">
                    {stats.savingsRate.toFixed(0)}% salvo
                  </span>
                  <span className="truncate">das receitas</span>
                </>
              ) : (
                <span className="text-rose-500 dark:text-rose-400 font-medium truncate">
                  Gastos superaram receitas
                </span>
              )
            ) : stats.totalExpenses > 0 ? (
              <span className="text-slate-400 truncate">Sem receitas cadastradas</span>
            ) : (
              <span className="text-slate-400 truncate">Mês sem movimentações</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
