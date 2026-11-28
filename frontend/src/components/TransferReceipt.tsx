import type { Transfer } from '../api/types'
import { formatDateTime } from '../lib/format'
import { Money, StatusPill } from './ui'

/** `mine` = ids of the viewer's own accounts, used to label each side. */
export function TransferReceipt({ t, mine }: { t: Transfer; mine: Set<number> }) {
  const side = (id: number, number: string) => (
    <>
      <span className="num">{number}</span>
      <span className="muted"> {mine.has(id) ? '· your account' : '· another LedgerCore account'}</span>
    </>
  )
  return (
    <section className="receipt" aria-label="Transfer receipt">
      <div className="receipt-top">
        <Money value={t.amount} currency={t.currency} className="receipt-amount" />
        <StatusPill status={t.status} />
      </div>
      <dl>
        <dt>From</dt><dd>{side(t.sourceAccountId, t.sourceAccountNumber)}</dd>
        <dt>To</dt><dd>{side(t.targetAccountId, t.targetAccountNumber)}</dd>
        {t.description && (<><dt>Note</dt><dd>{t.description}</dd></>)}
        <dt>Date</dt><dd>{formatDateTime(t.createdAt)}</dd>
        <dt>Reference</dt><dd className="num">#{t.id}</dd>
        <dt>Request ID</dt><dd className="num small muted">{t.idempotencyKey}</dd>
      </dl>
    </section>
  )
}
