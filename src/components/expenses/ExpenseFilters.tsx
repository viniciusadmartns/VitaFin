import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SortOption } from '../../types/finance';
import { Search, ArrowUpDown, X, Tag, CreditCard } from 'lucide-react';

export const ExpenseFilters: React.FC = () => {
  const { categories, filter, setFilter, resetFilter, monthExpenses, filteredExpenses } =
    useFinance();

  const hasActiveFilters =
    filter.search.trim() !== '' ||
    filter.categoryId !== 'all' ||
    filter.paymentMethod !== 'all' ||
    filter.sortBy !== 'date-desc';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
      {/* Top row: Search input & Quick Reset */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Buscar por nome, categoria ou notas..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {filter.search && (
            <button
              type="button"
              onClick={() => setFilter({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reset button if active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilter}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Second row: Dropdown filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* Category Filter */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Tipo de Gasto
          </label>
          <select
            value={filter.categoryId}
            onChange={(e) => setFilter({ categoryId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Categorias ({monthExpenses.length})</option>
            {categories.map((cat) => {
              const countInMonth = monthExpenses.filter((e) => e.categoryId === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({countInMonth})
                </option>
              );
            })}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Forma de Pagamento
          </label>
          <select
            value={filter.paymentMethod}
            onChange={(e) => setFilter({ paymentMethod: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Formas</option>
            <option value="pix">PIX</option>
            <option value="credit">Cartão de Crédito</option>
            <option value="debit">Cartão de Débito</option>
            <option value="cash">Dinheiro</option>
            <option value="installment">Parcelado</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Ordenar Por
          </label>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter({ sortBy: e.target.value as SortOption })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="date-desc">Data (Mais recente primeiro)</option>
            <option value="date-asc">Data (Mais antiga primeiro)</option>
            <option value="amount-desc">Valor (Maior para menor)</option>
            <option value="amount-asc">Valor (Menor para maior)</option>
            <option value="title-asc">Nome (A a Z)</option>
            <option value="title-desc">Nome (Z a A)</option>
          </select>
        </div>
      </div>

      {/* Filter summary status */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <span>
          Exibindo <strong>{filteredExpenses.length}</strong> de{' '}
          <strong>{monthExpenses.length}</strong> gastos neste mês
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Filtros aplicados
          </span>
        )}
      </div>
    </div>
  );
};
