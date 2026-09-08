import React, { useMemo } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export const DividendEvolutionChart: React.FC = () => {
  const { dividends, selectedYear, filteredAssets } = useInvestment();

  const data = useMemo(() => {
    const ids = new Set(filteredAssets.map(a => a.id));
    const d = dividends.filter(div => div.paymentDate?.startsWith(selectedYear) && ids.has(div.assetId));
    const monthly: Record<string, number> = {};
    MONTHS.forEach(m => monthly[m] = 0);
    d.forEach(div => {
      const m = parseInt(div.paymentDate?.substring(5,7) || '1', 10) - 1;
      if (m >= 0 && m < 12) monthly[MONTHS[m]] += div.totalAmount || 0;
    });
    return MONTHS.map(m => ({ month: m, value: monthly[m] || 0 }));
  }, [dividends, selectedYear, filteredAssets]);

  const TooltipCustom = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[160px]">
        <div className="font-bold text-slate-200 mb-1.5 pb-1 border-b border-slate-700/60">{item.month}</div>
        <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-slate-300">Proventos:</span><span className="text-xs font-bold text-teal-400">{formatCurrency(item.value)}</span></div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
          Evolução dos Proventos
        </h3>
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{selectedYear}</span>
      </div>
      <div className="h-[240px] sm:h-[256px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#475569', opacity: 0.5 }} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<TooltipCustom />} cursor={{ fill: 'rgba(99,102,241,0.08)', radius: 6 }} />
            <Bar dataKey="value" radius={[4,4,0,0]} animationDuration={600}>
              {data.map((_, i) => <Cell key={i} fill={data[i].value > 0 ? '#14b8a6' : '#e2e8f0'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
