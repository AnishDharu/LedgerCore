import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAccount } from '../api/accounts'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { FundsDialog, type FundsMode } from '../components/FundsDialog'
import { StatusActions } from '../components/StatusActions'
import { EmptyState, ErrorNote, Money, StatusPill } from '../components/ui'
import { formatDate, titleCase } from '../lib/format'
import { useTitle } from '../lib/useTitle'

const STATUS_NOTE = {
  ACTIVE: null,
  FROZEN: 'This account is frozen. It can’t send or receive money until an administrator reactivates it.',
  CLOSED: 'This account is closed. Its history stays available, but it can’t be used again.',
} as const

export function AccountDetailPage() {
  const { id } = useParams()
  const accountId = Number(id)
  const { session, isAdmin } = useAuth()
  const [mode, setMode] = useState<FundsMode | null>(null)
  const [copied, setCopied] = useState(false)

  const q = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => getAccount(accountId),
    enabled: Number.isInteger(accountId),
  })

  useTitle(q.data?.accountNumber ?? 'Account')

  const notFound = !Number.isInteger(accountId) || (q.error instanceof ApiError && q.error.status === 404)
  // UI-level scoping only: the backend does not yet enforce ownership (see PROGRESS.md).
  const foreign = q.data && q.data.customerId !== session?.customerId && !isAdmin

  if (notFound || foreign) {
    return (
      <>
        <BackLink />
        <EmptyState title="Account not found">It may have been removed, or it isn’t one of your accounts.</EmptyState>
      </>
    )
  }
  if (q.isPending) return <><BackLink /><div className="skeleton" style={{ height: 220 }} aria-label="Loading account" /></>
  if (q.isError) return <><BackLink /><ErrorNote error={q.error} /></>

  const a = q.data
  const active = a.status === 'ACTIVE'
  const note = STATUS_NOTE[a.status]

  async function copy() {
    try { await navigator.clipboard.writeText(a.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }

  return (
    <>
      <BackLink />
      <header className="acct-head">
        <div>
          <h1 className="num acct-title">{a.accountNumber}</h1>
          <p className="muted">
            {titleCase(a.accountType)} account · opened {formatDate(a.createdAt)}{' '}
            <button className="btn btn-quiet linkish" onClick={copy}>{copied ? 'Copied' : 'Copy number'}</button>
          </p>
        </div>
        <StatusPill status={a.status} />
      </header>

      {note && <div className={`alert ${a.status === 'FROZEN' ? 'warn' : ''}`} role="status">{note}</div>}

      <section className="balance" aria-label="Balance">
        <div className="muted">Available balance</div>
        <Money value={a.balance} currency={a.currency} className="balance-figure" />
      </section>

      <div className="actions">
        {active ? <Link className="btn btn-primary" to={`/transfer?from=${a.id}`}>Send money</Link>
                : <button className="btn btn-primary" disabled>Send money</button>}
        <button className="btn" disabled={!active} onClick={() => setMode('deposit')}>Add funds</button>
        <button className="btn" disabled={!active || a.balance <= 0} onClick={() => setMode('withdraw')}>Withdraw</button>
        <Link className="btn btn-quiet" to={`/accounts/${a.id}/statement`}>View statement</Link>
      </div>

      {isAdmin && (
        <section className="admin-panel" aria-label="Administration">
          <h2>Administration</h2>
          <p className="muted small" style={{ marginBottom: 'var(--space-3)' }}>
            Owner: <Link to={`/admin/customers/${a.customerId}`}>customer #{a.customerId}</Link>. Status changes are recorded in the audit log.
          </p>
          <StatusActions account={a} />
        </section>
      )}

      <FundsDialog account={a} mode={mode} onClose={() => setMode(null)} />
    </>
  )
}

function BackLink() {
  return <p className="back"><Link to="/">← All accounts</Link></p>
}
