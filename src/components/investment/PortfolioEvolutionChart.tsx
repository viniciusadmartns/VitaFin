import React, { useMemo } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, BarChart3 } from 'lucide-react';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const PortfolioEvolutionChart: React.FC = () => {
  const { dividends, transactions, filteredAssets, selectedYear } = useInvestment();

  // Dados: Evolução de Proventos
  const proventosData = useMemo(() => {
    const visibleAssetIds = new Set(filteredAssets.map(a => a.id));
    const yearDividends = dividends.filter(
      d => d.paymentDate && d.paymentDate.startsWith(selectedYear) && visibleAssetIds.has(d.assetId)
    );

    const monthlyTotals: number[] = Array(12).fill(0);
    yearDividends.forEach(d => {
      const monthIndex = parseInt(d.paymentDate.substring(5, 7), 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyTotals[monthIndex] += d.totalAmount || 0;
      }
    });

    let cumulative = 0;
    return MONTHS.map((label, i) => {
      cumulative += monthlyTotals[i];
      return {
        month: label,
        monthFull: MONTHS_FULL[i],
        dividends: monthlyTotals[i],
        cumulative,
        year: selectedYear
      };
    });
  }, [dividends, filteredAssets, selectedYear]);

  // Dados: Evolução de Patrimônio
  const patrimonioData = useMemo(() => {
    let baseValue = 0;
    const monthlyValues: number[] = Array(12).fill(0);

    filteredAssets.forEach(a => {
      // Busca transações deste ativo específico
      const assetTxs = transactions.filter(t => t.assetId === a.id);

      if (assetTxs.length > 0) {
        // Se tem transações, usa as datas reais das transações para montar a linha do tempo
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
        // Se adicionado manualmente (sem transações), aloca o valor total no mês de criação
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
      return {
        month: label,
        monthFull: MONTHS_FULL[i],
        invested: monthlyValues[i],
        value: cumulative,
        year: selectedYear
      };
    });
  }, [transactions, filteredAssets, selectedYear]);

  // Tooltips customizados
  const ProventosTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[160px]">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/60">
            <span className="font-bold text-slate-200">{item.monthFull} {item.year}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300">Proventos:</span>
              <span className="text-xs font-bold text-teal-400">{formatCurrency(item.dividends)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300">Acumulado:</span>
              <span className="text-xs font-bold text-emerald-400">{formatCurrency(item.cumulative)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PatrimonioTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[160px]">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/60">
            <span className="font-bold text-slate-200">{item.monthFull} {item.year}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300">Aporte líquido:</span>
              <span className="text-xs font-bold text-blue-400">{formatCurrency(item.invested)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300">Patrimônio:</span>
              <span className="text-xs font-bold text-emerald-400">{formatCurrency(item.value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Evolução dos Proventos */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
            Evolução dos Proventos
          </h3>
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {selectedYear}
          </span>
        </div>

        <div className="h-44 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={proventosData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#475569', opacity: 0.5 }} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<ProventosTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)', radius: 6 }} />
              <Bar dataKey="dividends" radius={[4, 4, 0, 0]} animationDuration={600}>
                {proventosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.dividends > 0 ? '#14b8a6' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Evolução de Patrimônio */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            Evolução de Patrimônio
          </h3>
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {selectedYear}
          </span>
        </div>

        <div className="h-44 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={patrimonioData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#475569', opacity: 0.5 }} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<PatrimonioTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorPatrimonio)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
