/** Spreadsheet apps run cells starting with these as formulas; prefix a quote to neutralise. */
function safeCell(v: string | number): string {
  let s = String(v)
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(header: string[], rows: Array<Array<string | number>>): string {
  return [header, ...rows].map(r => r.map(safeCell).join(',')).join('\r\n')
}

export function downloadCsv(filename: string, csv: string) {
  // BOM so Excel reads UTF-8 (₹, accents) correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
