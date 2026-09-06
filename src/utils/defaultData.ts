import { Category, Expense } from '../types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  // Categorias de Despesas (Saídas)
  {
    id: 'cat-alimentacao',
    name: 'Alimentação',
    color: '#EF4444', // Vermelho
    icon: 'utensils',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-compras',
    name: 'Compras & Roupas',
    color: '#14B8A6', // Turquesa
    icon: 'shopping-bag',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-educacao',
    name: 'Educação & Estudos',
    color: '#EC4899', // Rosa
    icon: 'graduation-cap',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-lazer',
    name: 'Lazer & Entretenimento',
    color: '#8B5CF6', // Roxo
    icon: 'film',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-moradia',
    name: 'Moradia & Contas',
    color: '#3B82F6', // Azul
    icon: 'home',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-outros',
    name: 'Outros / Diversos',
    color: '#64748B', // Ardósia
    icon: 'more-horizontal',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-saude',
    name: 'Saúde & Farmácia',
    color: '#10B981', // Verde Esmeralda
    icon: 'heart-pulse',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-mercado',
    name: 'Supermercado',
    color: '#F97316', // Laranja
    icon: 'shopping-cart',
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-transporte',
    name: 'Transporte & Carro',
    color: '#F59E0B', // Âmbar
    icon: 'car',
    type: 'expense',
    isDefault: true,
  },

  // Categorias de Receitas (Entradas)
  {
    id: 'cat-salario',
    name: 'Salário & Remuneração',
    color: '#10B981', // Verde Esmeralda
    icon: 'banknote',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-freelance',
    name: 'Freelance & Serviços',
    color: '#3B82F6', // Azul
    icon: 'briefcase',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-investimentos',
    name: 'Rendimentos & Dividendos',
    color: '#8B5CF6', // Roxo
    icon: 'trending-up',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-vendas',
    name: 'Vendas & Negócios',
    color: '#F59E0B', // Âmbar
    icon: 'shopping-bag',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-bonus',
    name: 'Bônus & Prêmios',
    color: '#EC4899', // Rosa
    icon: 'gift',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-outras-entradas',
    name: 'Outras Receitas',
    color: '#14B8A6', // Turquesa
    icon: 'wallet',
    type: 'income',
    isDefault: true,
  },
];

export function getSampleExpenses(): Expense[] {
  return [];
}
