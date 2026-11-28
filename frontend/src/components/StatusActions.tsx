import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAccountStatus } from '../api/accounts'
import type { Account, AccountStatus } from '../api/types'
import { formatMoney } from '../lib/format'
import { Dialog } from './Dialog'
import { ErrorNote } from './ui'

interface Action { to: AccountStatus; label: string; confirm: string; danger?: boolean }

const ACTIONS: Record<AccountStatus, Action[]> = {
  ACTIVE: [
    { to: 'FROZEN', label: 'Freeze account', confirm: 'The account will stop sending and receiving money until you reactivate it.' },
    { to: 'CLOSED', label: 'Close account', danger: true, confirm: 'Closing is permanent. The account can never be reopened, though its history stays available.' },
  ],
  FROZEN: [
    { to: 'ACTIVE', label: 'Reactivate account', confirm: 'The account will be able to send and receive money again.' },
    { to: 'CLOSED', label: 'Close account', danger: true, confirm: 'Closing is permanent. The account can never be reopened, though its history stays available.' },
  ],
  CLOSED: [],
}

/** Admin-only. The backend enforces the role; the UI also hides these for everyone else. */
export function StatusActions({ account }: { account: Account }) {
  const qc = useQueryClient()
  const [pending, setPending] = useState<Action | null>(null)

  const m = useMutation({
    mutationFn: (to: AccountStatus) => updateAccountStatus(account.id, to),
    onSuccess: updated => {
      qc.setQueryData(['account', account.id], updated)
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['audit'] })
      close()
    },
  })

  function close() { m.reset(); setPending(null) }
  const actions = ACTIONS[account.status]
  if (actions.length === 0) return <p className="muted small">Closed accounts can’t be changed.</p>

  // docs/account-lifecycle.md: closure needs a zero balance. The backend doesn't check it yet, so the UI does.
  const mustEmpty = account.balance > 0

  return (
    <>
      <div className="actions">
        {actions.map(a => {
          const blocked = a.to === 'CLOSED' && mustEmpty
          return (
            <button key={a.to} className={`btn ${a.danger ? 'btn-danger' : ''}`} disabled={blocked}
              aria-describedby={blocked ? `why-${account.id}` : undefined} onClick={() => setPending(a)}>
              {a.label}
            </button>
          )
        })}
      </div>
      {mustEmpty && actions.some(a => a.to === 'CLOSED') && (
        <p id={`why-${account.id}`} className="muted small" style={{ marginTop: 'var(--space-2)' }}>
          To close this account its balance must be zero. It holds {formatMoney(account.balance, account.currency)}.
        </p>
      )}

      <Dialog open={pending !== null} title={`${pending?.label ?? ''}?`} onClose={close}>
        <p className="num small" style={{ marginBottom: 'var(--space-2)' }}>{account.accountNumber}</p>
        <p>{pending?.confirm}</p>
        {m.error && <div style={{ marginTop: 'var(--space-4)' }}><ErrorNote error={m.error} /></div>}
        <div className="dialog-actions">
          <button className="btn" onClick={close}>Cancel</button>
          <button className={`btn ${pending?.danger ? 'btn-danger' : 'btn-primary'}`} disabled={m.isPending} onClick={() => pending && m.mutate(pending.to)}>
            {m.isPending ? 'Working…' : pending?.label}
          </button>
        </div>
      </Dialog>
    </>
  )
}
