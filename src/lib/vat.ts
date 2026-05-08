/**
 * Swedish VAT (moms) utilities for Ceylon Express.
 *
 * Ceylon Express operates as pickup/delivery only (no dine-in).
 * All food sold is classified as "livsmedel" (food product), not "serveringstjänst".
 *
 * Rate history:
 *   Before 1 Apr 2026  →  12%  (standard livsmedel rate)
 *   From 1 Apr 2026    →   6%  (temporary reduction, valid through 31 Dec 2027)
 *
 * Source: Skatteverket — Momssatser och undantag från moms
 * https://skatteverket.se/foretag/moms/saljavarorochtjanster/momssatserochundantagfranmoms
 */

const VAT_CUTOFF_DATE = '2026-04-01'

export const VAT_RATE_PRE_CUTOFF = 0.12   // 12% before 1 Apr 2026
export const VAT_RATE_POST_CUTOFF = 0.06  // 6% from 1 Apr 2026

/**
 * Returns the applicable VAT rate for a given delivery date (YYYY-MM-DD).
 * Uses string comparison — safe because delivery_date is always ISO format.
 */
export function getVatRate(deliveryDate: string): number {
  return deliveryDate >= VAT_CUTOFF_DATE ? VAT_RATE_POST_CUTOFF : VAT_RATE_PRE_CUTOFF
}

export interface VatBreakdown {
  net: number
  vatAmount: number
  gross: number
  ratePercent: number
}

/**
 * Back-calculates VAT from a VAT-inclusive (gross) amount.
 *
 * Formula: vatAmount = gross × (rate / (1 + rate))
 *          net       = gross − vatAmount
 *
 * Example at 12%: 180 SEK → net 160.71, VAT 19.29
 * Example at  6%: 180 SEK → net 169.81, VAT 10.19
 */
export function calculateVatFromGross(gross: number, rate: number): VatBreakdown {
  const vatAmount = gross * (rate / (1 + rate))
  return {
    net: Math.round((gross - vatAmount) * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    gross,
    ratePercent: rate * 100,
  }
}
