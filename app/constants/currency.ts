// Currency configuration for the entire application
export const CURRENCY = 'SEK'
export const CURRENCY_SYMBOL = 'kr' // Optional: Swedish Krona symbol
export const DELIVERY_FEE = 50 // Delivery fee in SEK

/**
 * Format a price with the configured currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to use symbol (kr) or code (SEK). Default is code.
 * @returns Formatted price string
 */
export function formatPrice(amount: number, showSymbol: boolean = false): string {
  const formattedAmount = amount.toFixed(2)
  const currencyDisplay = showSymbol ? CURRENCY_SYMBOL : CURRENCY
  return `${formattedAmount} ${currencyDisplay}`
}
