import { api } from './client'
import type { Account, AccountStatus, AccountType } from './types'

export const listAccountsForCustomer = (customerId: number) =>
  api<Account[]>(`/accounts/customer/${customerId}`)

export const getAccount = (id: number) => api<Account>(`/accounts/${id}`)

export const getAccountByNumber = (accountNumber: string) =>
  api<Account>(`/accounts/number/${encodeURIComponent(accountNumber)}`)

export const createAccount = (customerId: number, accountType: AccountType) =>
  api<Account>('/accounts', { method: 'POST', body: { customerId, accountType } })

export const deposit = (id: number, amount: number) =>
  api<Account>(`/accounts/${id}/deposit`, { method: 'POST', body: { amount } })

export const withdraw = (id: number, amount: number) =>
  api<Account>(`/accounts/${id}/withdraw`, { method: 'POST', body: { amount } })

/** ADMIN only (enforced by the backend). */
export const updateAccountStatus = (id: number, status: AccountStatus) =>
  api<Account>(`/accounts/${id}/status`, { method: 'PATCH', body: { status } })
