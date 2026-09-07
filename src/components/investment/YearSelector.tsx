import React from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';

export const YearSelector: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    goToPreviousYear,
    goToNextYear,
    goToCurrentYear,
    availableYears,
  } = useInvestment();

  const currentYear = String(new Date().getFullYear());
  const isCurrentYear = selectedYear === currentYear;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Navegação de Ano com Setas */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <button
          type="button"
          onClick={goToPreviousYear}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-95"
          title="Ano Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-1 sm:px-2 min-w-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            Ano de {selectedYear}
          </h2>
        </div>

        <button
          type="button"
          onClick={goToNextYear}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-95"
          title="Próximo Ano"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Botão de Atalho "Ano Atual" e Dropdown de Seleção de Ano */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
        {!isCurrentYear ? (
          <button
            type="button"
            onClick={goToCurrentYear}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 sm:px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ano Atual ({currentYear})</span>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        <div className="relative flex items-center flex-1 sm:flex-initial">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-auto text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-center"
            title="Escolher ano específico"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                Ano {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
