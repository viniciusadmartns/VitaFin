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
} from 'recharts';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

export const DailyBarChart: React.FC = () => {
  const { stats, selectedMonth, theme } = useFinance();

  const data = stats.dailySummaries;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/60">
            <span className="font-bold text-slate-200">Dia {item.day}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.dayName}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300 font-medium">Gastos do dia:</span>
              <span className="text-xs font-bold text-rose-400">
                {formatCurrency(item.expenses ?? item.amount ?? 0)}
              </span>
            </div>

            {(item.expenses ?? item.amount ?? 0) === 0 && (
              <p className="text-[10px] text-slate-400 italic">Sem despesas neste dia</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            Evolução Diária
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gastos ao longo dos dias de {formatMonthYear(selectedMonth)}
          </p>
        </div>
      </div>

      <div className="h-52 sm:h-72 w-full mt-1 sm:mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === 'dark' ? '#334155' : '#f1f5f9'}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: theme === 'dark' ? '#334155' : '#e2e8f0' }}
              tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }}
              tickFormatter={(value) =>
                `R$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
                radius: 6,
              }}
              isAnimationActive={true}
              animationDuration={200}
              animationEasing="ease-out"
              wrapperStyle={{ zIndex: 40, pointerEvents: 'none' }}
            />

            <Bar
              name="Gastos"
              dataKey="expenses"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer transition-opacity hover:opacity-85"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
