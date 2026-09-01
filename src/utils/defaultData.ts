import { Category, Expense } from '../types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-alimentacao',
    name: 'Alimentação',
    color: '#EF4444', // Vermelho
    icon: 'utensils',
    isDefault: true,
  },
  {
    id: 'cat-mercado',
    name: 'Supermercado',
    color: '#F97316', // Laranja
    icon: 'shopping-cart',
    isDefault: true,
  },
  {
    id: 'cat-moradia',
    name: 'Moradia & Contas',
    color: '#3B82F6', // Azul
    icon: 'home',
    isDefault: true,
  },
  {
    id: 'cat-transporte',
    name: 'Transporte & Carro',
    color: '#F59E0B', // Âmbar
    icon: 'car',
    isDefault: true,
  },
  {
    id: 'cat-saude',
    name: 'Saúde & Farmácia',
    color: '#10B981', // Verde Esmeralda
    icon: 'heart-pulse',
    isDefault: true,
  },
  {
    id: 'cat-lazer',
    name: 'Lazer & Entretenimento',
    color: '#8B5CF6', // Roxo
    icon: 'film',
    isDefault: true,
  },
  {
    id: 'cat-educacao',
    name: 'Educação & Estudos',
    color: '#EC4899', // Rosa
    icon: 'graduation-cap',
    isDefault: true,
  },
  {
    id: 'cat-compras',
    name: 'Compras & Roupas',
    color: '#14B8A6', // Turquesa
    icon: 'shopping-bag',
    isDefault: true,
  },
  {
    id: 'cat-outros',
    name: 'Outros / Diversos',
    color: '#64748B', // Ardósia
    icon: 'more-horizontal',
    isDefault: true,
  },
];

export function getSampleExpenses(): Expense[] {
  return [];
}
