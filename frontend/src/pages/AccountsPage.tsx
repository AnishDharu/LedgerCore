import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listAccountsForCustomer } from '../api/accounts'
import type { Account } from '../api/types'
import { useSession } from '../auth/AuthContext'
import { OpenAccountDialog } from '../components/OpenAccountDialog'
import { EmptyState, ErrorNote, Money, PageHeader, StatusPill } from '../components/ui'
import { titleCase } from '../lib/format'

function totalsByCurrency(accounts: Account[]) {
  const totals = new Map<string, number>()
  // Closed accounts hold no usable funds; count only open ones.
  for (const a of accounts) if (a.status !== 'CLOSED') totals.set(a.currency, (totals.get(a.currency) ?? 0) + a.balance)
  return [...totals.entries()]
}

export function AccountsPage() {
  const { customerId, fullName } = useSession()
  const nav = useNavigate()
  const [opening, setOpening] = useState(false)
  const q = useQuery({ queryKey: ['accounts', customerId], queryFn: () => listAccountsForCustomer(customerId) })

  return (
    <>
      <PageHeader title="Accounts">
        <button className="btn btn-primary" onClick={() => setOpening(true)}>Open an account</button>
      </PageHeader>

      {q.isPending && <div className="skeleton" style={{ height: 160 }} aria-label="Loading accounts" />}
      {q.isError && <ErrorNote error={q.error} />}

      {q.data && q.data.length === 0 && (
        <EmptyState title={`Welcome, ${fullName.split(' ')[0]}`}>
          You don't have an account yet. Open one to add funds and send money.
        </EmptyState>
      )}

      {q.data && q.data.length > 0 && (
        <div className="table-scroll">
        <table className="ledger accounts">
          <caption className="sr-only">Your accounts</caption>
          <thead>
            <tr><th>Account</th><th>Type</th><th>Status</th><th className="r">Balance</th></tr>
          </thead>
          <tbody>
            {q.data.map(a => (
              <tr key={a.id} className="row-link" onClick={() => nav(`/accounts/${a.id}`)}>
                <td><Link to={`/accounts/${a.id}`} className="num acct-no" onClick={e => e.stopPropagation()}>{a.accountNumber}</Link></td>
                <td>{titleCase(a.accountType)}</td>
                <td><StatusPill status={a.status} /></td>
                <td className="r"><Money value={a.balance} currency={a.currency} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {totalsByCurrency(q.data).map(([cur, total]) => (
              <tr key={cur}>
                <th colSpan={3} scope="row">Total available{totalsByCurrency(q.data).length > 1 ? ` (${cur})` : ''}</th>
                <td className="r"><Money value={total} currency={cur} /></td>
              </tr>
            ))}
          </tfoot>
        </table>
        </div>
      )}

      <OpenAccountDialog open={opening} onClose={() => setOpening(false)} onCreated={a => nav(`/accounts/${a.id}`)} />
    </>
  )
}
