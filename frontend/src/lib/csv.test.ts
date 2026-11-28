import { describe, expect, it } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('joins rows with CRLF and quotes cells that need it', () => {
    expect(toCsv(['a', 'b'], [['x,y', 'say "hi"'], ['line\nbreak', 3]])).toBe('a,b\r\n"x,y","say ""hi"""\r\n"line\nbreak",3')
  })
  it('neutralises spreadsheet formulas in text cells', () => {
    expect(toCsv(['n'], [['=SUM(A1)'], ['+1'], ['-2'], ['@cmd']])).toBe("n\r\n'=SUM(A1)\r\n'+1\r\n'-2\r\n'@cmd")
  })
  it('leaves real negative numbers alone', () => {
    expect(toCsv(['n'], [[-5]])).toBe('n\r\n-5')
  })
})
