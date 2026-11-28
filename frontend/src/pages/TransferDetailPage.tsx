import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { getTransfer } from '../api/transfers'
import { useAuth } from '../auth/AuthContext'
import { TransferReceipt } from '../components/TransferReceipt'
import { EmptyState, ErrorNote, PageHeader } from '../components/ui'
import { useMyAccounts } from '../lib/useMyAccounts'

export function TransferDetailPage() {
  const id = Number(useParams().id)
  const { isAdmin } = useAuth()
  const accountsQ = useMyAccounts()
  const q = useQuery({ queryKey: ['transfer', id], queryFn: () => getTransfer(id), enabled: Number.isInteger(id) })

  const mine = new Set((accountsQ.data ?? []).map(a => a.id))
  const missing = !Number.isInteger(id) || (q.error instanceof ApiError && q.error.status === 404)
  // UI-level scoping only: the backend does not yet enforce ownership (see PROGRESS.md).
  const foreign = q.data && accountsQ.data && !isAdmin && !mine.has(q.data.sourceAccountId) && !mine.has(q.data.targetAccountId)

  const back = <p className="back"><Link to="/transfers">← All transfers</Link></p>
  if (missing || foreign) return <>{back}<EmptyState title="Transfer not found">It may not exist, or it doesn’t involve one of your accounts.</EmptyState></>
  if (q.isError) return <>{back}<ErrorNote error={q.error} /></>
  if (q.isPending || accountsQ.isPending) return <>{back}<div className="skeleton" style={{ height: 240 }} aria-label="Loading transfer" /></>

  return (
    <>
      {back}
      <PageHeader title={`Transfer #${q.data.id}`} />
      <TransferReceipt t={q.data} mine={mine} />
    </>
  )
}
