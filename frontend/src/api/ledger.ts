import { api } from './client'
import type { LedgerEntry } from './types'

/** Newest first. */
export const getLedger = (accountId: number) => api<LedgerEntry[]>(`/ledger/account/${accountId}`)
