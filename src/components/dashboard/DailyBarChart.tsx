import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

export const DailyBarChart: React.FC = () => {
  const { stats, selectedMonth, theme } = useFinance();

  const data = stats.dailySummaries;
  const hasExpenses = stats.total > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-sm">
          <p className="font-bold text-slate-300 mb-1">
            Dia {item.day} ({item.dayName})
          </p>
          <p className="text-sm font-extrabold text-emerald-300">
            {formatCurrency(item.total)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Evolução Diária de Gastos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Despesas acumuladas ao longo dos dias de {formatMonthYear(selectedMonth)}
          </p>
        </div>
        {hasExpenses && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" />
            <span>Média: {formatCurrency(stats.averagePerDay)}/dia</span>
          </div>
        )}
      </div>

      <div className="h-60 sm:h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === 'dark' ? '#334155' : '#f1f5f9'}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: theme === 'dark' ? '#334155' : '#e2e8f0' }}
              tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }}
              tickFormatter={(value) => `R$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {hasExpenses && stats.averagePerDay > 0 && (
              <ReferenceLine
                y={stats.averagePerDay}
                stroke="#6366f1"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
            )}
            <Bar
              dataKey="total"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              className="transition-all hover:opacity-80 cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
