export type Role = 'CUSTOMER' | 'ADMIN'
export type AccountType = 'SAVINGS' | 'CURRENT'
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED'
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export type EntryType = 'DEBIT' | 'CREDIT'

/** Decimal amounts arrive as JSON numbers; keep them as numbers for display only. */
export interface AuthResponse {
  token: string
  tokenType: string
  customerId: number
  fullName: string
  email: string
  role: Role
}

export interface RegisterRequest {
  fullName: string
  email: string
  phoneNumber?: string
  password: string
}

export interface Customer {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  role: Role
  active: boolean
  createdAt: string
}

export interface Account {
  id: number
  customerId: number
  accountNumber: string
  accountType: AccountType
  status: AccountStatus
  currency: string
  balance: number
  createdAt: string
}

export interface Transfer {
  id: number
  idempotencyKey: string
  sourceAccountId: number
  sourceAccountNumber: string
  targetAccountId: number
  targetAccountNumber: string
  amount: number
  currency: string
  status: TransferStatus
  description: string | null
  createdAt: string
}

export interface TransferRequest {
  sourceAccountId: number
  targetAccountId: number
  amount: number
  description?: string
}

export interface LedgerEntry {
  id: number
  transferId: number
  accountId: number
  accountNumber: string
  entryType: EntryType
  amount: number
  balanceAfter: number
  createdAt: string
}

export interface Reconciliation {
  balanced: boolean
  totalDebits: number
  totalCredits: number
  discrepancy: number
  checkedAt: string
}

export interface AuditLog {
  id: number
  userId: number | null
  action: string
  entityType: string
  entityId: number | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
}
