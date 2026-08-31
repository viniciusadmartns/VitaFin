import { Category, Expense, MonthBudget } from '../types/finance';
import { formatDate } from './formatters';

/**
 * Exporta os gastos filtrados ou do mês para formato CSV compatível com Excel
 */
export function exportExpensesToCSV(
  expenses: Expense[],
  categories: Category[],
  monthLabel: string
): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Data', 'Nome do Gasto', 'Categoria', 'Valor (R$)', 'Forma de Pagamento', 'Parcelamento', 'Observações'];

  const rows = expenses.map((exp) => {
    const categoryName = categoryMap.get(exp.categoryId) || 'Não categorizado';
    const cleanNotes = (exp.notes || '').replace(/"/g, '""');
    const cleanTitle = exp.title.replace(/"/g, '""');
    const formattedAmount = exp.amount.toFixed(2).replace('.', ',');
    const installmentInfo = exp.installmentNumber && exp.totalInstallments
      ? `${exp.installmentNumber}/${exp.totalInstallments}`
      : '-';

    const paymentLabel = exp.paymentMethod === 'installment'
      ? 'PARCELADO'
      : exp.paymentMethod?.toUpperCase() || 'NÃO INFORMADO';

    return [
      formatDate(exp.date),
      `"${cleanTitle}"`,
      `"${categoryName}"`,
      `"${formattedAmount}"`,
      `"${paymentLabel}"`,
      `"${installmentInfo}"`,
      `"${cleanNotes}"`,
    ].join(';');
  });

  const csvContent = '﻿' + [headers.join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `gastos_vitafin_${monthLabel.toLowerCase().replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta todos os dados do aplicativo para um arquivo JSON de backup
 */
export function exportBackupJSON(
  expenses: Expense[],
  categories: Category[],
  budgets: MonthBudget[]
): void {
  const data = {
    app: 'VitaFin',
    version: '2.0',
    exportDate: new Date().toISOString(),
    categories,
    expenses,
    budgets,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `backup_vitafin_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida e importa arquivo JSON de backup
 */
export function validateAndParseBackup(jsonText: string): {
  categories?: Category[];
  expenses?: Expense[];
  budgets?: MonthBudget[];
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Arquivo JSON inválido.');
    }

    const categories = Array.isArray(parsed.categories) ? parsed.categories : undefined;
    const expenses = Array.isArray(parsed.expenses) ? parsed.expenses : undefined;
    const budgets = Array.isArray(parsed.budgets) ? parsed.budgets : undefined;

    return { categories, expenses, budgets };
  } catch {
    throw new Error('Falha ao processar arquivo de backup. Verifique se o arquivo JSON é válido.');
  }
}
