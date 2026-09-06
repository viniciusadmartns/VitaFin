import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Category, TransactionType } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { AVAILABLE_ICONS, PRESET_COLORS, renderCategoryIcon } from '../../utils/icons';
import { Search, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  initialType?: TransactionType;
  onSaved?: (category: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  initialType = 'expense',
  onSaved,
}) => {
  const { addCategory, updateCategory } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState('utensils');
  const [iconSearch, setIconSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setType(categoryToEdit.type || 'expense');
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color);
      setIcon(categoryToEdit.icon);
    } else {
      setType(initialType);
      setName('');
      setColor(
        initialType === 'income'
          ? '#10B981'
          : PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
      );
      setIcon(initialType === 'income' ? 'banknote' : 'shopping-bag');
    }
    setError('');
    setIconSearch('');
  }, [categoryToEdit, isOpen, initialType]);

  const filteredIcons = AVAILABLE_ICONS.filter(
    (item) =>
      item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const isIncome = type === 'income';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(
        isIncome
          ? 'Por favor, informe o nome da categoria de receita.'
          : 'Por favor, informe o nome da categoria de despesa.'
      );
      return;
    }

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: name.trim(),
        color,
        icon,
        type,
      });
      if (onSaved) {
        onSaved({ ...categoryToEdit, name: name.trim(), color, icon, type });
      }
    } else {
      const created = addCategory({
        name: name.trim(),
        color,
        icon,
        type,
      });
      if (onSaved) {
        onSaved(created);
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        categoryToEdit
          ? isIncome
            ? 'Editar Categoria de Receita'
            : 'Editar Categoria de Despesa'
          : isIncome
          ? 'Nova Categoria de Receita'
          : 'Nova Categoria de Despesa'
      }
      subtitle={
        isIncome
          ? 'Cadastre uma categoria para organizar suas fontes de entradas e receitas'
          : 'Cadastre uma categoria para organizar suas saídas e despesas mensais'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Segmented Switch: Despesa vs Receita */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isIncome
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>Despesa (Saída)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isIncome
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Receita (Entrada)</span>
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            Pré-visualização
          </span>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform"
              style={{ backgroundColor: color }}
            >
              {renderCategoryIcon(icon, 'w-6 h-6')}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                {name || 'Nome da Categoria'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {isIncome ? 'Categoria de Receita (Entrada)' : 'Categoria de Despesa (Saída)'}
              </p>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Nome da Categoria <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder={
              isIncome
                ? 'Ex: Salário, Consultorias, Dividendos, Aluguel recebido...'
                : 'Ex: Alimentação, Moradia, Transporte, Lazer...'
            }
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            autoFocus
          />
          {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
        </div>

        {/* Color Palette Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Cor Identificadora
          </label>
          <div className="flex flex-wrap gap-2.5 items-center">
            {PRESET_COLORS.map((presetColor) => {
              const isSelected = color.toLowerCase() === presetColor.toLowerCase();
              return (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-xl transition-all relative ${
                    isSelected
                      ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <Sparkles className="w-3.5 h-3.5 drop-shadow" />
                    </span>
                  )}
                </button>
              );
            })}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                title="Escolher cor personalizada"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                {color}
              </span>
            </div>
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Ícone
            </label>
            <span className="text-xs text-slate-400">
              {filteredIcons.length} ícones disponíveis
            </span>
          </div>

          {/* Search Icons */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Buscar ícone (ex: salário, dinheiro, carro, café, casa)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl">
            {filteredIcons.map((item) => {
              const isSelected = icon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'
                  }`}
                  title={item.label}
                >
                  {renderCategoryIcon(
                    item.name,
                    `w-5 h-5 mb-1 ${
                      isSelected
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`
                  )}
                  <span className="text-[10px] truncate max-w-full text-center">
                    {item.label.split('/')[0].split('&')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
            {categoryToEdit
              ? 'Salvar Alterações'
              : isIncome
              ? 'Cadastrar Categoria de Receita'
              : 'Cadastrar Categoria de Despesa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
