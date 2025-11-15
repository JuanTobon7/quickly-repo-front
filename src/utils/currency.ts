/**
 * Format a number as Colombian Peso currency
 * @param value - The number to format
 * @param includeSymbol - Whether to include the $ symbol
 * @returns Formatted string with thousands separators
 */
export function formatCurrency(value: number, includeSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return includeSymbol ? formatted : formatted.replace(/[^\d.,]/g, '').trim();
}

/**
 * Format a number with thousands separators (no currency symbol)
 * @param value - The number to format
 * @returns Formatted string with thousands separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parse a formatted currency string back to a number
 * @param formattedValue - The formatted string
 * @returns The numeric value
 */
export function parseCurrency(formattedValue: string): number {
  // Remove all non-numeric characters except decimal separator
  const cleaned = formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Format input value as user types (for controlled inputs)
 * @param value - Current input value
 * @returns Formatted value with thousands separators
 */
export function formatInputCurrency(value: string): string {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Parse as number and format
  const number = parseInt(numericValue, 10);
  return formatNumber(number);
}
