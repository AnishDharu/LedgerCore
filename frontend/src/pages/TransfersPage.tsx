import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { listTransfersForAccount } from '../api/transfers'
import type { Transfer } from '../api/types'
import { EmptyState, ErrorNote, Money, PageHeader, StatusPill } from '../components/ui'
import { formatDateTime } from '../lib/format'
import { useMyAccounts } from '../lib/useMyAccounts'

type Dir = 'sent' | 'received' | 'own'

export function directionOf(t: Transfer, focus: Set<number>): Dir {
  const from = focus.has(t.sourceAccountId), to = focus.has(t.targetAccountId)
  if (from && to) return 'own'
  return from ? 'sent' : 'received'
}

export function TransfersPage() {
  const nav = useNavigate()
  const accountsQ = useMyAccounts()
  const accounts = useMemo(() => accountsQ.data ?? [], [accountsQ.data])
  const [filter, setFilter] = useState<number | 'all'>('all')

  const results = useQueries({
    queries: accounts.map(a => ({ queryKey: ['transfers', 'account', a.id], queryFn: () => listTransfersForAccount(a.id) })),
  })
  const loading = accountsQ.isPending || results.some(r => r.isPending)
  const error = accountsQ.error ?? results.find(r => r.error)?.error

  const { rows, focus } = useMemo(() => {
    const focus = new Set(filter === 'all' ? accounts.map(a => a.id) : [filter])
    const byId = new Map<number, Transfer>()
    for (const r of results) for (const t of r.data ?? []) byId.set(t.id, t)
    const rows = [...byId.values()]
      .filter(t => focus.has(t.sourceAccountId) || focus.has(t.targetAccountId))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    return { rows, focus }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.map(r => r.dataUpdatedAt).join(), accounts, filter])

  return (
    <>
      <PageHeader title="Transfers">
        <Link className="btn btn-primary" to="/transfer">Send money</Link>
      </PageHeader>

      {accounts.length > 1 && (
        <div className="field filter-one">
          <label htmlFor="acct-filter">Account</label>
          <select id="acct-filter" value={filter} onChange={e => setFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">All my accounts</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}
          </select>
        </div>
      )}

      {error != null && <ErrorNote error={error} />}
      {loading && !error && <div className="skeleton" style={{ height: 180 }} aria-label="Loading transfers" />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState title="No transfers yet">Money you send or receive shows up here.</EmptyState>
      )}

      {rows.length > 0 && (
        <div className="table-scroll">
          <table className="ledger">
            <caption className="sr-only">Transfers</caption>
            <thead><tr><th>Date</th><th>Details</th><th>Status</th><th className="r">Amount</th></tr></thead>
            <tbody>
              {rows.map(t => {
                const d = directionOf(t, focus)
                return (
                  <tr key={t.id} className="row-link" onClick={() => nav(`/transfers/${t.id}`)}>
                    <td className="nowrap">{formatDateTime(t.createdAt)}</td>
                    <td>
                      <Link to={`/transfers/${t.id}`} onClick={e => e.stopPropagation()} className="plain">
                        {d === 'sent' && <>Sent to <span className="num">{t.targetAccountNumber}</span></>}
                        {d === 'received' && <>Received from <span className="num">{t.sourceAccountNumber}</span></>}
                        {d === 'own' && <>Between your accounts</>}
                      </Link>
                      {t.description && <div className="muted small">{t.description}</div>}
                    </td>
                    <td><StatusPill status={t.status} /></td>
                    <td className={`r ${d === 'sent' ? 'debit' : d === 'received' ? 'credit' : ''}`}>
                      {d === 'sent' ? '−' : d === 'received' ? '+' : ''}<Money value={t.amount} currency={t.currency} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
