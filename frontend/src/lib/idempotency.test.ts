import { describe, expect, it } from 'vitest'
import { createKeyKeeper, newIdempotencyKey } from './idempotency'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('idempotency keys', () => {
  it('generates RFC 4122 v4 UUIDs', () => {
    for (let i = 0; i < 20; i++) expect(newIdempotencyKey()).toMatch(UUID)
  })
  it('reuses the key for an identical request (a retry)', () => {
    const k = createKeyKeeper()
    expect(k.keyFor([1, 2, 10, 'rent'])).toBe(k.keyFor([1, 2, 10, 'rent']))
  })
  it('mints a new key when any detail changes', () => {
    const k = createKeyKeeper()
    const a = k.keyFor([1, 2, 10, 'rent'])
    expect(k.keyFor([1, 2, 11, 'rent'])).not.toBe(a)
    expect(k.keyFor([1, 3, 11, 'rent'])).not.toBe(a)
  })
  it('mints a new key after reset (a new transfer)', () => {
    const k = createKeyKeeper()
    const a = k.keyFor([1, 2, 10, ''])
    k.reset()
    expect(k.keyFor([1, 2, 10, ''])).not.toBe(a)
  })
})
