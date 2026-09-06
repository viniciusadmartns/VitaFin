import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SortOption } from '../../types/finance';
import { Search, ArrowUpDown, X, Tag, CreditCard, TrendingDown, TrendingUp, Layers } from 'lucide-react';

export const ExpenseFilters: React.FC = () => {
  const { categories, filter, setFilter, resetFilter, monthExpenses, filteredExpenses } =
    useFinance();

  const hasActiveFilters =
    filter.search.trim() !== '' ||
    filter.type !== 'all' ||
    filter.categoryId !== 'all' ||
    filter.paymentMethod !== 'all' ||
    filter.sortBy !== 'date-desc';

  const expenseCount = monthExpenses.filter((e) => (e.type || 'expense') === 'expense').length;
  const incomeCount = monthExpenses.filter((e) => e.type === 'income').length;

  return (
    <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
      {/* Top row: Type Tabs (Todos / Despesas / Receitas) & Search */}
      <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
        {/* Type Toggle Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setFilter({ type: 'all' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter.type === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Todos ({monthExpenses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter({ type: 'expense' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter.type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Despesas ({expenseCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter({ type: 'income' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter.type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Receitas ({incomeCount})</span>
          </button>
        </div>

        {/* Search input & Reset */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Buscar por descrição, categoria ou notas..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {filter.search && (
              <button
                type="button"
                onClick={() => setFilter({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Limpar busca"
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
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 rounded-xl transition-colors flex-shrink-0"
              title="Limpar todos os filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Second row: Dropdown filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-0.5">
        {/* Category Filter */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Categoria
          </label>
          <select
            value={filter.categoryId}
            onChange={(e) => setFilter({ categoryId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Categorias</option>
            {categories
              .filter((c) => filter.type === 'all' || (c.type || 'expense') === filter.type)
              .map((cat) => {
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
            <option value="pix">Pix/Débito</option>
            <option value="credit">Cartão</option>
            <option value="installment">Parcelamento</option>
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
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
        <span>
          Exibindo <strong>{filteredExpenses.length}</strong> de{' '}
          <strong>{monthExpenses.length}</strong> lançamentos neste mês
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            Filtros ativos
          </span>
        )}
      </div>
    </div>
  );
};
