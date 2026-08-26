/**
 * Format a number as Philippine Peso currency string (e.g. ₱12,450.00)
 */
export function formatCurrencyPHP(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '₱0.00';
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(num)) return '₱0.00';

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number with commas (e.g. 1,250)
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '0';
  return new Intl.NumberFormat('en-PH').format(num);
}
