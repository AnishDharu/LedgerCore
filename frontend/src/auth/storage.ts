import type { AuthResponse } from '../api/types'

const KEY = 'ledgercore.session'

export type Session = Pick<AuthResponse, 'token' | 'customerId' | 'fullName' | 'email' | 'role'>

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(s: Session) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage unavailable */ }
}

export function clearSession() {
  try { localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}

export function getToken(): string | null {
  return loadSession()?.token ?? null
}
