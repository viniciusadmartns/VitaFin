import { PaymentMethod } from '../types/finance';

/**
 * Formata um número como valor monetário brasileiro (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converte string digitada para valor numérico (ex: "1.250,50" -> 1250.50)
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  // Remove tudo exceto dígitos, vírgula e ponto
  const clean = value.replace(/[^\d.,]/g, '');
  if (!clean) return 0;

  // Se houver vírgula como decimal
  if (clean.includes(',')) {
    const withoutPoints = clean.replace(/\./g, '');
    const withDotDecimal = withoutPoints.replace(',', '.');
    const parsed = parseFloat(withDotDecimal);
    return isNaN(parsed) ? 0 : parsed;
  }

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata data no formato DD/MM/AAAA
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  // dateString is typically YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return dateString;
  }
}

/**
 * Retorna o nome do mês e ano (ex: "Agosto de 2026")
 */
export function formatMonthYear(yearMonth: string): string {
  if (!yearMonth) return '';
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month)) return yearMonth;

  const date = new Date(year, month - 1, 1);
  const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
}

/**
 * Retorna o mês e ano atual no formato YYYY-MM
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula o mês anterior (YYYY-MM)
 */
export function getPreviousYearMonth(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Calcula o próximo mês (YYYY-MM)
 */
export function getNextYearMonth(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Adiciona N meses a uma data YYYY-MM-DD com ajuste seguro de dias
 */
export function addMonthsToDate(isoDate: string, monthsToAdd: number): string {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const totalMonths = month + monthsToAdd;
  const targetYear = year + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;

  // Dias máximos no mês destino
  const maxDays = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(day, maxDays);

  const formattedMonth = String(targetMonth + 1).padStart(2, '0');
  const formattedDay = String(targetDay).padStart(2, '0');

  return `${targetYear}-${formattedMonth}-${formattedDay}`;
}

/**
 * Retorna o número de dias em um determinado mês
 */
export function getDaysInMonth(yearMonth: string): number {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  return new Date(year, month, 0).getDate();
}

/**
 * Mapeamento e label de métodos de pagamento
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { label: string; icon: string }> = {
  pix: { label: 'PIX', icon: 'Zap' },
  credit: { label: 'Cartão de Crédito', icon: 'CreditCard' },
  debit: { label: 'Cartão de Débito', icon: 'CreditCard' },
  cash: { label: 'Dinheiro', icon: 'Banknote' },
  installment: { label: 'Parcelado', icon: 'Layers' },
};
