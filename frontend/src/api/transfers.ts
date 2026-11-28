import { api } from './client'
import type { Transfer, TransferRequest } from './types'

/** The Idempotency-Key header lets the server ignore a repeat of the same request. */
export const executeTransfer = (idempotencyKey: string, req: TransferRequest) =>
  api<Transfer>('/transfers', { method: 'POST', body: req, headers: { 'Idempotency-Key': idempotencyKey } })

export const getTransfer = (id: number) => api<Transfer>(`/transfers/${id}`)

export const listTransfersForAccount = (accountId: number) =>
  api<Transfer[]>(`/transfers/account/${accountId}`)
