import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listAccountsForCustomer } from '../api/accounts'
import { getCustomer } from '../api/admin'
import { ApiError } from '../api/client'
import { StatusActions } from '../components/StatusActions'
import { EmptyState, ErrorNote, Money, PageHeader, StatusPill } from '../components/ui'
import { formatDate, titleCase } from '../lib/format'

export function AdminCustomerDetailPage() {
  const id = Number(useParams().id)
  const valid = Number.isInteger(id)
  const cq = useQuery({ queryKey: ['customer', id], queryFn: () => getCustomer(id), enabled: valid })
  const aq = useQuery({ queryKey: ['accounts', id], queryFn: () => listAccountsForCustomer(id), enabled: valid })

  const back = <p className="back"><Link to="/admin/customers">← All customers</Link></p>
  if (!valid || (cq.error instanceof ApiError && cq.error.status === 404)) return <>{back}<EmptyState title="Customer not found">They may have been removed.</EmptyState></>
  if (cq.isError) return <>{back}<ErrorNote error={cq.error} /></>
  if (cq.isPending) return <>{back}<div className="skeleton" style={{ height: 200 }} aria-label="Loading customer" /></>
  const c = cq.data

  return (
    <>
      {back}
      <PageHeader title={c.fullName}>
        <Link className="btn" to={`/admin/audit?user=${c.id}`}>View audit log</Link>
      </PageHeader>
      <dl className="facts">
        <dt>Email</dt><dd className="wrap-any">{c.email}</dd>
        <dt>Phone</dt><dd>{c.phoneNumber || <span className="muted">Not provided</span>}</dd>
        <dt>Role</dt><dd>{titleCase(c.role)}</dd>
        <dt>Joined</dt><dd>{formatDate(c.createdAt)}</dd>
        <dt>Customer ID</dt><dd className="num">{c.id}</dd>
      </dl>

      <h2 className="section-title">Accounts</h2>
      {aq.isPending && <div className="skeleton" style={{ height: 120 }} aria-label="Loading accounts" />}
      {aq.isError && <ErrorNote error={aq.error} />}
      {aq.data?.length === 0 && <p className="muted">This customer hasn’t opened an account.</p>}
      {aq.data && aq.data.length > 0 && (
        <div className="admin-accounts">
          {aq.data.map(a => (
            <section key={a.id} className="admin-account" aria-label={`Account ${a.accountNumber}`}>
              <div className="admin-account-head">
                <div>
                  <Link to={`/accounts/${a.id}`} className="num plain"><strong>{a.accountNumber}</strong></Link>
                  <span className="muted"> · {titleCase(a.accountType)} · opened {formatDate(a.createdAt)}</span>
                </div>
                <div className="admin-account-meta"><StatusPill status={a.status} /><Money value={a.balance} currency={a.currency} /></div>
              </div>
              <StatusActions account={a} />
              <p className="small" style={{ marginTop: 'var(--space-3)' }}>
                <Link to={`/accounts/${a.id}/statement`}>Statement</Link>
              </p>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
