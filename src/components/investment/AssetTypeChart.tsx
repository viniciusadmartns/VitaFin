import React, { useMemo } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7']; // indigo + purple

export const AssetTypeChart: React.FC = () => {
  const { filteredAssets } = useInvestment();

  const data = useMemo(() => {
    let fiiCount = 0;
    let stockCount = 0;
    let fiiValue = 0;
    let stockValue = 0;

    filteredAssets.forEach(asset => {
      const ticker = (asset.ticker || '').toUpperCase();
      const name = (asset.name || '').toUpperCase();
      const type = asset.type || '';
      const isFund = type === 'fund' || name.includes('FII') || name.includes('FUNDO') || name.includes('IMOBILIÁRIO') || name.includes('IMOBILIARIO') || (ticker.endsWith('11') && !['SANB11','TAEE11','KLBN11','ALUP11','BPAC11','ENGI11','TIET11','SAPR11','SULA11','BBDC11','BBAS11'].includes(ticker));
      if (isFund) {
        fiiCount += 1;
        fiiValue += asset.currentValue || 0;
      } else {
        stockCount += 1;
        stockValue += asset.currentValue || 0;
      }
    });

    return [
      { name: 'FII', value: fiiValue, count: fiiCount, color: COLORS[0] },
      { name: 'Ação', value: stockValue, count: stockCount, color: COLORS[1] },
    ].filter(d => d.value > 0 || d.count > 0);
  }, [filteredAssets]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <PieChartIcon className="w-4 h-4" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">Tipo de Ativo</h3>
      </div>
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[160px]">
                    <div className="font-bold text-slate-200 mb-1.5 pb-1 border-b border-slate-700/60">{item.name}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-slate-300">Valor:</span><span className="text-xs font-bold text-teal-400">R$ {item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                      <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-slate-300">Ativos:</span><span className="text-xs font-bold text-slate-200">{item.count}</span></div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend verticalAlign="bottom" height={24} iconType="square" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 justify-center">
        {data.map(d => (
          <span key={d.name} className="flex items-center gap-1.5">
            {d.name}: {d.count} ativo{d.count !== 1 ? 's' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};
