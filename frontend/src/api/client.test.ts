import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, setUnauthorizedHandler } from './client'

const store = new Map<string, string>()
const json = (status: number, body?: unknown) => new Response(body === undefined ? '' : JSON.stringify(body), { status })

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) })
  store.set('ledgercore.session', JSON.stringify({ token: 'tok', customerId: 1, fullName: 'A', email: 'a@b.c', role: 'CUSTOMER' }))
})
afterEach(() => { vi.unstubAllGlobals(); setUnauthorizedHandler(null) })

describe('api client', () => {
  it('prefixes /api, sends the bearer token and parses JSON', async () => {
    const f = vi.fn().mockResolvedValue(json(200, { ok: 1 }))
    vi.stubGlobal('fetch', f)
    await expect(api('/accounts/1')).resolves.toEqual({ ok: 1 })
    const [url, init] = f.mock.calls[0]
    expect(url).toBe('/api/accounts/1')
    expect(init.headers.Authorization).toBe('Bearer tok')
  })

  it('sends a JSON body and custom headers', async () => {
    const f = vi.fn().mockResolvedValue(json(201, { id: 1 }))
    vi.stubGlobal('fetch', f)
    await api('/transfers', { method: 'POST', body: { a: 1 }, headers: { 'Idempotency-Key': 'k' } })
    const init = f.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"a":1}')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.headers['Idempotency-Key']).toBe('k')
  })

  it('turns a server error body into ApiError with its message and status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(422, { message: 'Insufficient funds' })))
    await expect(api('/x')).rejects.toMatchObject({ name: 'ApiError', status: 422, message: 'Insufficient funds' })
  })

  it('reports an unreachable server as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const err: unknown = await api('/x').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(0)
  })

  it('ends the session on an empty 401 (expired token)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(401)))
    const onExpired = vi.fn(); setUnauthorizedHandler(onExpired)
    await expect(api('/x')).rejects.toMatchObject({ status: 401 })
    expect(onExpired).toHaveBeenCalledOnce()
    expect(store.has('ledgercore.session')).toBe(false)
  })

  it('keeps the session on a 403 that carries a business message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(403, { message: 'Account is frozen' })))
    const onExpired = vi.fn(); setUnauthorizedHandler(onExpired)
    await expect(api('/x')).rejects.toMatchObject({ status: 403, message: 'Account is frozen' })
    expect(onExpired).not.toHaveBeenCalled()
    expect(store.has('ledgercore.session')).toBe(true)
  })

  it('does not log out on bad credentials from login (skipAuth)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(401, { message: 'Invalid email or password' })))
    const onExpired = vi.fn(); setUnauthorizedHandler(onExpired)
    await expect(api('/auth/login', { method: 'POST', body: {}, skipAuth: true })).rejects.toMatchObject({ message: 'Invalid email or password' })
    expect(onExpired).not.toHaveBeenCalled()
    expect(store.has('ledgercore.session')).toBe(true)
  })
})
