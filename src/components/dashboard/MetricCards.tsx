import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
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
  const { stats, selectedMonth, getCategoryById } = useFinance();

  const highestCat = stats.highestExpense
    ? getCategoryById(stats.highestExpense.categoryId)
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Gasto no Mês */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 w-full" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total do Mês
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(stats.total)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.count} {stats.count === 1 ? 'despesa registrada' : 'despesas registradas'}
          </p>
        </div>
      </div>

      {/* 2. Média Diária de Gastos */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Média por Dia
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(stats.averagePerDay)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Considerando os dias do mês
          </p>
        </div>
      </div>

      {/* 3. Maior Gasto do Mês */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 w-full" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Maior Despesa
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          {stats.highestExpense ? (
            <>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatCurrency(stats.highestExpense.amount)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5" title={stats.highestExpense.title}>
                {highestCat && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: highestCat.color }}
                  />
                )}
                <span className="truncate">{stats.highestExpense.title}</span>
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-600">
                -
              </h3>
              <p className="text-xs text-slate-400">Nenhum gasto lançado</p>
            </>
          )}
        </div>
      </div>

      {/* 4. Orçamento / Meta Mensal */}
      <div
        onClick={onOpenBudgetModal}
        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500/60 transition-all"
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
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Meta / Orçamento
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          {stats.budget ? (
            <>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {formatCurrency(stats.budget)}
                </h3>
                <span
                  className={`text-xs font-bold ${
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
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  {(stats.remainingBudget || 0) >= 0 ? 'Disponível: ' : 'Ultrapassou: '}
                  <strong className={(stats.remainingBudget || 0) < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                    {formatCurrency(Math.abs(stats.remainingBudget || 0))}
                  </strong>
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                  Ajustar
                </span>
              </p>
            </>
          ) : (
            <div className="py-1">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                Definir Orçamento <ArrowUpRight className="w-4 h-4" />
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Estabeleça um teto de gastos para {formatMonthYear(selectedMonth)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
