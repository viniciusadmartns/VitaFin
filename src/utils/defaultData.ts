import { Category, Expense } from '../types/finance';
import { getCurrentYearMonth } from './formatters';

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
  const currentYM = getCurrentYearMonth();
  return [
    {
      id: 'sample-1',
      title: 'Supermercado do Mês',
      amount: 450.80,
      date: `${currentYM}-03`,
      categoryId: 'cat-mercado',
      paymentMethod: 'credit',
      notes: 'Compras gerais de mantimentos e limpeza',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      title: 'Aluguel & Condomínio',
      amount: 1400.00,
      date: `${currentYM}-05`,
      categoryId: 'cat-moradia',
      paymentMethod: 'pix',
      notes: 'Pagamento mensal moradia',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      title: 'Abastecimento Gasolina',
      amount: 220.50,
      date: `${currentYM}-08`,
      categoryId: 'cat-transporte',
      paymentMethod: 'debit',
      notes: 'Tanque cheio posto Shell',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-4',
      title: 'Almoço Restaurante com amigos',
      amount: 85.90,
      date: `${currentYM}-12`,
      categoryId: 'cat-alimentacao',
      paymentMethod: 'pix',
      notes: 'Almoço de domingo',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-5',
      title: 'Farmácia - Vitaminas e Remédios',
      amount: 115.30,
      date: `${currentYM}-15`,
      categoryId: 'cat-saude',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample-6',
      title: 'Assinatura Streaming & Cinema',
      amount: 55.90,
      date: `${currentYM}-18`,
      categoryId: 'cat-lazer',
      paymentMethod: 'credit',
      createdAt: new Date().toISOString(),
    },
  ];
}
