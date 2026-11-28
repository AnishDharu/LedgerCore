export type Theme = 'light' | 'dark'
const KEY = 'ledgercore.theme'

export function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(t: Theme, persist = true) {
  document.documentElement.dataset.theme = t
  if (!persist) return
  try { localStorage.setItem(KEY, t) } catch { /* storage unavailable */ }
}
