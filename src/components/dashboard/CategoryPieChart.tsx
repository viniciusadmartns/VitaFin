import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { renderCategoryIcon } from '../../utils/icons';
import { PieChart as PieIcon } from 'lucide-react';

export const CategoryPieChart: React.FC = () => {
  const { stats, setFilter, filter } = useFinance();

  const data = stats.categorySummaries.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
    icon: item.category.icon,
    percentage: item.percentage,
    count: item.count,
    id: item.category.id,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-full flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 mb-3">
          <PieIcon className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
          Distribuição por Tipo de Gasto
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Cadastre despesas neste mês para visualizar o gráfico de gastos por categoria.
        </p>
      </div>
    );
  }

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold">{item.name}</span>
          </div>
          <p className="text-sm font-extrabold text-indigo-300">
            {formatCurrency(item.value)}
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {item.percentage.toFixed(1)}% do total ({item.count} {item.count === 1 ? 'gasto' : 'gastos'})
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
            <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Gastos por Tipo de Gasto
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Proporção de despesas nas categorias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-56 sm:h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => {
                      if (filter.categoryId === entry.id) {
                        setFilter({ categoryId: 'all' });
                      } else {
                        setFilter({ categoryId: entry.id });
                      }
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(stats.total)}
            </span>
          </div>
        </div>

        {/* Category List with ranking bars */}
        <div className="lg:col-span-7 space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {stats.categorySummaries.map((catSummary) => {
            const isFilterActive = filter.categoryId === catSummary.category.id;
            return (
              <div
                key={catSummary.category.id}
                onClick={() => {
                  if (isFilterActive) {
                    setFilter({ categoryId: 'all' });
                  } else {
                    setFilter({ categoryId: catSummary.category.id });
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isFilterActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                }`}
                title="Clique para filtrar gastos por esta categoria"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: catSummary.category.color }}
                    >
                      {renderCategoryIcon(catSummary.category.icon, 'w-3.5 h-3.5')}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {catSummary.category.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({catSummary.count})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(catSummary.total)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-12 text-right">
                      {catSummary.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Mini category bar */}
                <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${catSummary.percentage}%`,
                      backgroundColor: catSummary.category.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
