import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { renderCategoryIcon } from '../../utils/icons';
import { PieChart as PieIcon, X } from 'lucide-react';

export const CategoryPieChart: React.FC = () => {
  const { stats, setFilter, filter } = useFinance();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = stats.categorySummaries.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
    icon: item.category.icon,
    percentage: item.percentage,
    count: item.count,
    id: item.category.id,
  }));

  const handleToggleCategory = (categoryId: string) => {
    if (filter.categoryId === categoryId) {
      setFilter({ categoryId: 'all' });
    } else {
      setFilter({ categoryId });
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-full flex flex-col justify-center items-center text-center min-h-[220px]">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 mb-2.5 sm:mb-3">
          <PieIcon className="w-5 h-5 sm:w-6 sm:h-6" />
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

  const selectedIndex = filter.categoryId !== 'all'
    ? data.findIndex((d) => d.id === filter.categoryId)
    : -1;

  const displayActiveIndex = hoveredIndex !== null
    ? hoveredIndex
    : (selectedIndex >= 0 ? selectedIndex : null);

  // Active slice animated shape with reliable click handler
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    const isSelected = filter.categoryId === payload?.id;

    return (
      <g
        className="cursor-pointer"
        onClick={() => payload?.id && handleToggleCategory(payload.id)}
      >
        {/* Glow / Halo Effect */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + (isSelected ? 9 : 7)}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={isSelected ? 0.35 : 0.2}
        />
        {/* Main expanded slice */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + (isSelected ? 7 : 5)}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: isSelected
              ? 'drop-shadow(0px 8px 18px rgba(0, 0, 0, 0.35))'
              : 'drop-shadow(0px 6px 14px rgba(0, 0, 0, 0.25))',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          }}
        />
      </g>
    );
  };

  // Custom sleek Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isSelected = filter.categoryId === item.id;

      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white px-3 py-2 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md pointer-events-none min-w-[140px] transition-all duration-150">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full ring-2 ring-white/20 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-bold text-slate-100 truncate text-[11px] sm:text-xs">{item.name}</span>
            </div>
            {isSelected && (
              <span className="text-[8px] uppercase font-extrabold bg-indigo-500/80 text-white px-1 py-0.2 rounded">
                Filtrado
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-emerald-400">
            {formatCurrency(item.value)}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1 pt-1 border-t border-slate-700/60">
            <span>{item.percentage.toFixed(1)}% do mês</span>
            <span>{item.count} {item.count === 1 ? 'gasto' : 'gastos'}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const activeCategory = displayActiveIndex !== null && displayActiveIndex >= 0 && displayActiveIndex < data.length
    ? data[displayActiveIndex]
    : null;

  const isFilterActive = filter.categoryId !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            Gastos por Tipo de Gasto
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Proporção de despesas nas categorias
          </p>
        </div>

        {isFilterActive && (
          <button
            type="button"
            onClick={() => setFilter({ categoryId: 'all' })}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center flex-1">
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-48 sm:h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={<CustomTooltip />}
                isAnimationActive={true}
                animationDuration={200}
                animationEasing="ease-out"
                wrapperStyle={{ zIndex: 40, pointerEvents: 'none' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={82}
                paddingAngle={3}
                dataKey="value"
                activeIndex={displayActiveIndex !== null ? displayActiveIndex : undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(entry: any) => {
                  const catId = entry?.id || entry?.payload?.id;
                  if (catId) handleToggleCategory(catId);
                }}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                cursor="pointer"
              >
                {data.map((entry, index) => {
                  const isSelected = filter.categoryId === entry.id;
                  const isOtherSelected = isFilterActive && !isSelected;

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={isOtherSelected && hoveredIndex !== index ? 0.35 : 1}
                      className="cursor-pointer transition-opacity duration-300"
                      onClick={() => handleToggleCategory(entry.id)}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Dynamic Center Text in Donut Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center transition-all duration-300">
            {activeCategory ? (
              <div className="animate-in fade-in zoom-in-90 duration-200 flex flex-col items-center max-w-[100px] sm:max-w-[110px]">
                {filter.categoryId === activeCategory.id && (
                  <span className="text-[8px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded-full mb-0.5">
                    Filtrado
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate w-full">
                  {activeCategory.name}
                </span>
                <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {formatCurrency(activeCategory.value)}
                </span>
                <span
                  className="text-[10px] sm:text-[11px] font-bold mt-0.5 px-1.5 py-0.2 rounded-full"
                  style={{ color: activeCategory.color }}
                >
                  {activeCategory.percentage.toFixed(1)}%
                </span>
              </div>
            ) : (
              <div className="animate-in fade-in duration-200 flex flex-col items-center">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {formatCurrency(stats.total)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                  {stats.count} {stats.count === 1 ? 'gasto' : 'gastos'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category List with ranking bars */}
        <div className="lg:col-span-7 space-y-2 max-h-52 sm:max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {stats.categorySummaries.map((catSummary, index) => {
            const isCategorySelected = filter.categoryId === catSummary.category.id;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={catSummary.category.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleToggleCategory(catSummary.category.id)}
                className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                  isCategorySelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                    : isHovered
                    ? 'bg-slate-100/90 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 shadow-sm scale-[1.01]'
                    : isFilterActive
                    ? 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40 opacity-60 hover:opacity-100'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                }`}
                title="Clique para filtrar gastos por esta categoria"
              >
                <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: catSummary.category.color,
                        transform: isHovered || isCategorySelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {renderCategoryIcon(catSummary.category.icon, 'w-3 h-3 sm:w-3.5 sm:h-3.5')}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {catSummary.category.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({catSummary.count})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(catSummary.total)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-10 sm:w-12 text-right">
                      {catSummary.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Mini category bar */}
                <div className="w-full h-1 sm:h-1.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
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
