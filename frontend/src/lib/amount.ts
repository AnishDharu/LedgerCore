/**
 * Money input handling. The backend accepts up to 15 integer digits and 4 decimals,
 * minimum 0.01. We keep the user's text as a string and only convert on submit.
 */
const AMOUNT_RE = /^\d{1,15}(\.\d{1,4})?$/

export function parseAmount(text: string): { value: number } | { error: string } {
  const t = text.trim().replace(/,/g, '')
  if (!t) return { error: 'Enter an amount.' }
  if (!AMOUNT_RE.test(t)) return { error: 'Use numbers only, with up to 4 decimal places.' }
  const value = Number(t)
  if (value < 0.01) return { error: 'The amount must be at least 0.01.' }
  return { value }
}
