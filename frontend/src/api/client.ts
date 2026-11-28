import { clearSession, getToken } from '../auth/storage'
import type { ApiErrorBody } from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Called when the server says our token is no longer valid. Set by AuthProvider. */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) { onUnauthorized = fn }

interface Options {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  /** Login/register return 401 for bad credentials — that must not log the user out. */
  skipAuth?: boolean
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = opts.skipAuth ? null : getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the backend is running and try again.')
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = null }
  }

  if (!res.ok) {
    const body = data as ApiErrorBody | null
    // Spring's filter chain answers expired/invalid tokens with an empty 401 (or 403) body.
    // Real business errors always carry a JSON message, so an empty body means "session over".
    const sessionOver = !opts.skipAuth && !body?.message && (res.status === 401 || res.status === 403)
    if (sessionOver) {
      clearSession()
      onUnauthorized?.()
      throw new ApiError(res.status, 'Your session has expired. Please sign in again.')
    }
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`)
  }
  return data as T
}
