import { describe, expect, it } from 'vitest'
import { parseAmount } from './amount'

describe('parseAmount', () => {
  it.each([['12.34', 12.34], ['1,250.75', 1250.75], ['0.01', 0.01], [' 5 ', 5], ['999999999999999.9999', 999999999999999.9999]])('accepts %s', (text, value) => {
    expect(parseAmount(text)).toEqual({ value })
  })
  it.each(['', '   ', 'abc', '-5', '1e3', '1.23456', '1234567890123456', '12.', '.5'])('rejects %j', text => {
    expect('error' in parseAmount(text)).toBe(true)
  })
  it('rejects zero and sub-minimum amounts', () => {
    expect(parseAmount('0')).toEqual({ error: expect.stringContaining('at least 0.01') })
    expect(parseAmount('0.001')).toEqual({ error: expect.stringContaining('at least 0.01') })
  })
})
