import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatMonthYear,
  getCurrentYearMonth,
} from '../../utils/formatters';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export const MonthSelector: React.FC = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useFinance();

  const currentYM = getCurrentYearMonth();
  const isCurrentMonth = selectedMonth === currentYM;

  return (
    <div className="bg-white dark:bg-slate-900 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Month Navigator with Arrows */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Mês Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 px-2">
          <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
            {formatMonthYear(selectedMonth)}
          </h2>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Próximo Mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Date Picker Input & Quick "Mês Atual" Shortcut */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={goToCurrentMonth}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-xl transition-colors"
          >
            Voltar para Mês Atual
          </button>
        )}

        <div className="relative flex items-center">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedMonth(e.target.value);
              }
            }}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            title="Escolher mês e ano específico"
          />
        </div>
      </div>
    </div>
  );
};
