import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingDown,
  Calendar,
  Zap,
  Target,
  ArrowUpRight,
} from 'lucide-react';

interface MetricCardsProps {
  onOpenBudgetModal: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onOpenBudgetModal }) => {
  const { stats, getCategoryById } = useFinance();

  const highestCat = stats.highestExpense
    ? getCategoryById(stats.highestExpense.categoryId)
    : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Gasto no Mês */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 w-full" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            Total do Mês
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
            {formatCurrency(stats.total)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {stats.count} {stats.count === 1 ? 'despesa' : 'despesas'}
          </p>
        </div>
      </div>

      {/* 2. Média Diária de Gastos */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            Média por Dia
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
            {formatCurrency(stats.averagePerDay)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            Por dia no mês
          </p>
        </div>
      </div>

      {/* 3. Maior Gasto do Mês */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 w-full" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            Maior Despesa
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          {stats.highestExpense ? (
            <>
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">
                {formatCurrency(stats.highestExpense.amount)}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1" title={stats.highestExpense.title}>
                {highestCat && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: highestCat.color }}
                  />
                )}
                <span className="truncate">{stats.highestExpense.title}</span>
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-400 dark:text-slate-600">
                -
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Nenhum gasto</p>
            </>
          )}
        </div>
      </div>

      {/* 4. Orçamento / Meta Mensal */}
      <div
        onClick={onOpenBudgetModal}
        className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500/60 transition-all flex flex-col justify-between"
        title="Clique para definir ou alterar o orçamento deste mês"
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
    </div>
  );
};
