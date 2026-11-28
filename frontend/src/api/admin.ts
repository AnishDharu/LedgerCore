import { api } from './client'
import type { AuditLog, Customer, Reconciliation } from './types'

export const listCustomers = () => api<Customer[]>('/customers')
export const getCustomer = (id: number) => api<Customer>(`/customers/${id}`)

/** ADMIN only (enforced by the backend). */
export const getReconciliation = () => api<Reconciliation>('/ledger/reconcile')
export const getAuditByUser = (userId: number) => api<AuditLog[]>(`/audit-logs/user/${userId}`)
export const getAuditByEntity = (entityType: string, entityId: number) =>
  api<AuditLog[]>(`/audit-logs/entity/${encodeURIComponent(entityType)}/${entityId}`)
