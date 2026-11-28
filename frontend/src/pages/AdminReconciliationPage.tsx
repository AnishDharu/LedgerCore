import { useQuery } from '@tanstack/react-query'
import { getReconciliation } from '../api/admin'
import { ErrorNote, Money, PageHeader } from '../components/ui'
import { formatDateTime } from '../lib/format'

export function AdminReconciliationPage() {
  // Always re-check on visit: a stale "balanced" result is worse than no result.
  const q = useQuery({ queryKey: ['reconcile'], queryFn: getReconciliation, staleTime: 0, gcTime: 0 })
  const r = q.data

  return (
    <>
      <PageHeader title="Reconciliation">
        <button className="btn btn-primary" onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? 'Checking…' : 'Check again'}</button>
      </PageHeader>
      <p className="muted" style={{ maxWidth: '62ch', marginBottom: 'var(--space-5)' }}>
        Every transfer posts one debit and one matching credit, so across the whole ledger the two totals must be equal.
      </p>

      {q.isPending && <div className="skeleton" style={{ height: 180 }} aria-label="Running check" />}
      {q.isError && <ErrorNote error={q.error} />}

      {r && (
        <>
          <div className={`alert ${r.balanced ? 'ok' : ''}`} role="status">
            {r.balanced
              ? 'The ledger is balanced. Total debits equal total credits.'
              : <>The ledger is out of balance by <Money value={r.discrepancy ?? 0} />. Investigate before any further transfers are trusted.</>}
          </div>
          <table className="ledger recon">
            <caption className="sr-only">Ledger totals</caption>
            <thead><tr><th>Total</th><th className="r">Amount</th></tr></thead>
            <tbody>
              <tr><td>Debits</td><td className="r debit"><Money value={r.totalDebits ?? 0} /></td></tr>
              <tr><td>Credits</td><td className="r credit"><Money value={r.totalCredits ?? 0} /></td></tr>
            </tbody>
            <tfoot><tr><th scope="row">Difference</th><td className="r"><Money value={r.discrepancy ?? 0} /></td></tr></tfoot>
          </table>
          <p className="muted small" style={{ marginTop: 'var(--space-3)' }}>
            Checked {formatDateTime(r.checkedAt)}. This compares ledger totals only; it doesn’t compare ledger entries with account balances.
          </p>
        </>
      )}
    </>
  )
}
