import { describe, expect, it } from 'vitest'
import { formatMoney, titleCase } from './format'

describe('format', () => {
  it('formats INR with Indian grouping and two decimals', () => {
    expect(formatMoney(1234567.5, 'INR')).toContain('12,34,567.50')
  })
  it('falls back instead of throwing on an unknown currency code', () => {
    expect(formatMoney(5, 'NOPE')).toBe('NOPE 5.00')
  })
  it('title-cases enum values', () => {
    expect(titleCase('SAVINGS')).toBe('Savings')
    expect(titleCase('FROZEN')).toBe('Frozen')
  })
})
