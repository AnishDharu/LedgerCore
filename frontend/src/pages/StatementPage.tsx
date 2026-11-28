import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAccount } from '../api/accounts'
import { ApiError } from '../api/client'
import { getLedger } from '../api/ledger'
import { listTransfersForAccount } from '../api/transfers'
import type { EntryType, LedgerEntry } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { EmptyState, ErrorNote, Money, PageHeader } from '../components/ui'
import { downloadCsv, toCsv } from '../lib/csv'
import { formatDateTime } from '../lib/format'

/** yyyy-mm-dd in the viewer's local time, to compare with <input type="date"> values. */
const localDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function StatementPage() {
  const accountId = Number(useParams().id)
  const { session, isAdmin } = useAuth()
  const valid = Number.isInteger(accountId)
  const [type, setType] = useState<'ALL' | EntryType>('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const acctQ = useQuery({ queryKey: ['account', accountId], queryFn: () => getAccount(accountId), enabled: valid })
  const ledgerQ = useQuery({ queryKey: ['ledger', accountId], queryFn: () => getLedger(accountId), enabled: valid })
  // Ledger entries carry no note or counterparty, so we join them to the transfer records.
  const transfersQ = useQuery({ queryKey: ['transfers', 'account', accountId], queryFn: () => listTransfersForAccount(accountId), enabled: valid })

  const details = useMemo(() => {
    const m = new Map<number, { counterparty: string; note: string | null }>()
    for (const t of transfersQ.data ?? []) m.set(t.id, { counterparty: t.targetAccountId === accountId ? t.sourceAccountNumber : t.targetAccountNumber, note: t.description })
    return m
  }, [transfersQ.data, accountId])

  const all = ledgerQ.data
  const rows = useMemo(() => (all ?? []).filter((e: LedgerEntry) => {
    if (type !== 'ALL' && e.entryType !== type) return false
    const day = localDay(e.createdAt)
    return (!from || day >= from) && (!to || day <= to)
  }), [all, type, from, to])

  const totals = useMemo(() => rows.reduce((s, e) => (e.entryType === 'DEBIT' ? { ...s, debit: s.debit + e.amount } : { ...s, credit: s.credit + e.amount }), { debit: 0, credit: 0 }), [rows])

  const back = <p className="back"><Link to={`/accounts/${accountId}`}>← Account</Link></p>
  const notFound = !valid || (acctQ.error instanceof ApiError && acctQ.error.status === 404)
  // UI-level scoping only: the backend does not yet enforce ownership (see PROGRESS.md).
  const foreign = acctQ.data && acctQ.data.customerId !== session?.customerId && !isAdmin
  if (notFound || foreign) return <>{back}<EmptyState title="Account not found">It may have been removed, or it isn’t one of your accounts.</EmptyState></>
  const error = acctQ.error ?? ledgerQ.error ?? transfersQ.error
  if (error) return <>{back}<ErrorNote error={error} /></>
  if (!acctQ.data || !all) return <>{back}<div className="skeleton" style={{ height: 260 }} aria-label="Loading statement" /></>

  const acct = acctQ.data
  const filtered = type !== 'ALL' || from !== '' || to !== ''
  const latestBalance = all[0]?.balanceAfter
  const drifted = all.length > 0 && latestBalance !== undefined && Math.abs(latestBalance - acct.balance) > 0.00005

  const describe = (e: LedgerEntry) => {
    const d = details.get(e.transferId)
    const who = d?.counterparty ?? ''
    return { text: e.entryType === 'DEBIT' ? `Sent to ${who}` : `Received from ${who}`, note: d?.note ?? null, who }
  }

  function exportCsv() {
    const csv = toCsv(
      ['Date', 'Transfer', 'Details', 'Note', 'Debit', 'Credit', 'Balance after'],
      rows.map(e => {
        const d = describe(e)
        return [new Date(e.createdAt).toISOString(), `#${e.transferId}`, d.text.trim(), d.note ?? '', e.entryType === 'DEBIT' ? e.amount.toFixed(2) : '', e.entryType === 'CREDIT' ? e.amount.toFixed(2) : '', e.balanceAfter.toFixed(2)]
      }),
    )
    downloadCsv(`statement-${acct.accountNumber}.csv`, csv)
  }

  return (
    <>
      {back}
      <PageHeader title="Statement">
        <button className="btn" onClick={exportCsv} disabled={rows.length === 0}>Download CSV</button>
      </PageHeader>
      <p className="muted stmt-sub"><span className="num">{acct.accountNumber}</span> · current balance <Money value={acct.balance} currency={acct.currency} /></p>

      {drifted && (
        <div className="alert warn" role="status">
          The balance above includes demo deposits and withdrawals, which aren’t ledger entries. This statement lists transfers only.
        </div>
      )}

      <div className="filters" role="group" aria-label="Filter statement">
        <div className="field">
          <label htmlFor="f-type">Show</label>
          <select id="f-type" value={type} onChange={e => setType(e.target.value as typeof type)}>
            <option value="ALL">Debits and credits</option>
            <option value="DEBIT">Debits only</option>
            <option value="CREDIT">Credits only</option>
          </select>
        </div>
        <div className="field"><label htmlFor="f-from">From</label><input id="f-from" type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} /></div>
        <div className="field"><label htmlFor="f-to">To</label><input id="f-to" type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} /></div>
        {filtered && <button className="btn btn-quiet filters-clear" onClick={() => { setType('ALL'); setFrom(''); setTo('') }}>Clear filters</button>}
      </div>

      {all.length === 0 && <EmptyState title="No ledger entries yet">Each transfer you send or receive appears here as a debit or a credit.</EmptyState>}
      {all.length > 0 && rows.length === 0 && <EmptyState title="Nothing matches those filters">Try a wider date range or clear the filters.</EmptyState>}

      {rows.length > 0 && (
        <div className="table-scroll">
          <table className="ledger statement">
            <caption className="sr-only">Statement for {acct.accountNumber}</caption>
            <thead>
              <tr><th>Date</th><th>Details</th><th className="r">Debit</th><th className="r">Credit</th><th className="r">Balance</th></tr>
            </thead>
            <tbody>
              {rows.map(e => {
                const d = describe(e)
                return (
                  <tr key={e.id}>
                    <td className="nowrap">{formatDateTime(e.createdAt)}</td>
                    <td>
                      <Link to={`/transfers/${e.transferId}`} className="plain">{d.text.trim()}</Link>
                      {d.note && <div className="muted small">{d.note}</div>}
                    </td>
                    <td className="r debit">{e.entryType === 'DEBIT' && <Money value={e.amount} currency={acct.currency} />}</td>
                    <td className="r credit">{e.entryType === 'CREDIT' && <Money value={e.amount} currency={acct.currency} />}</td>
                    <td className="r"><Money value={e.balanceAfter} currency={acct.currency} /></td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2}>Total{filtered ? ' (filtered)' : ''} · {rows.length} {rows.length === 1 ? 'entry' : 'entries'}</th>
                <td className="r debit">{totals.debit > 0 ? <Money value={totals.debit} currency={acct.currency} /> : <span className="muted" aria-label="none">–</span>}</td>
                <td className="r credit">{totals.credit > 0 ? <Money value={totals.credit} currency={acct.currency} /> : <span className="muted" aria-label="none">–</span>}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  )
}
