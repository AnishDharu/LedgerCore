/** RFC 4122 v4 UUID. crypto.randomUUID needs a secure context, so fall back for plain-http LAN testing. */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map(x => x.toString(16).padStart(2, '0'))
  return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`
}

/**
 * Keeps one key per distinct request. Re-submitting identical details (a retry after a network
 * failure) reuses the key so the server can't run it twice; changing anything mints a new one.
 */
export function createKeyKeeper() {
  let fingerprint = ''
  let key = ''
  return {
    keyFor(parts: Array<string | number>): string {
      const fp = parts.join('|')
      if (fp !== fingerprint || !key) { fingerprint = fp; key = newIdempotencyKey() }
      return key
    },
    reset() { fingerprint = ''; key = '' },
  }
}
