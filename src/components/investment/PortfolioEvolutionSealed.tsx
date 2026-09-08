import React, { useMemo } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export const PortfolioEvolutionChartSealed: React.FC = () => {
  const { transactions, filteredAssets, selectedYear } = useInvestment();

  const data = useMemo(() => {
    let baseValue = 0;
    const monthlyValues: number[] = Array(12).fill(0);

    filteredAssets.forEach(a => {
      const assetTxs = transactions.filter(t => t.assetId === a.id);

      if (assetTxs.length > 0) {
        assetTxs.forEach(t => {
          if (!t.date) return;
          const txYear = parseInt(t.date.substring(0, 4), 10);
          const amount = t.type === 'buy' ? (t.totalAmount || 0) : -(t.totalAmount || 0);

          if (txYear < parseInt(selectedYear, 10)) {
            baseValue += amount;
          } else if (txYear === parseInt(selectedYear, 10)) {
            const monthIndex = parseInt(t.date.substring(5, 7), 10) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              monthlyValues[monthIndex] += amount;
            }
          }
        });
      } else {
        const assetYear = a.createdAt ? parseInt(a.createdAt.substring(0, 4), 10) : parseInt(selectedYear, 10);
        if (assetYear < parseInt(selectedYear, 10)) {
          baseValue += (a.totalInvested || 0);
        } else if (assetYear === parseInt(selectedYear, 10)) {
          const monthIndex = a.createdAt ? parseInt(a.createdAt.substring(5, 7), 10) - 1 : 0;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyValues[monthIndex] += (a.totalInvested || 0);
          }
        }
      }
    });

    let cumulative = baseValue;
    return MONTHS.map((label, i) => {
      cumulative += monthlyValues[i];
      return { month: label, value: cumulative };
    });
  }, [transactions, filteredAssets, selectedYear]);

  const TooltipCustom = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[160px]">
        <div className="font-bold text-slate-200 mb-1.5 pb-1 border-b border-slate-700/60">{item.month}</div>
        <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-slate-300">Patrimônio:</span><span className="text-xs font-bold text-blue-400">{formatCurrency(item.value)}</span></div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          Evolução de Patrimônio
        </h3>
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{selectedYear}</span>
      </div>
      <div className="h-44 sm:h-56 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPatrimonioSealed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#475569', opacity: 0.5 }} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<TooltipCustom />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorPatrimonioSealed)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
