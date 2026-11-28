import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deposit, withdraw } from '../api/accounts'
import type { Account } from '../api/types'
import { parseAmount } from '../lib/amount'
import { formatMoney } from '../lib/format'
import { Dialog } from './Dialog'
import { ErrorNote } from './ui'

export type FundsMode = 'deposit' | 'withdraw'

interface Props {
  account: Account
  mode: FundsMode | null
  onClose: () => void
}

export function FundsDialog({ account, mode, onClose }: Props) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const isDeposit = mode === 'deposit'

  const m = useMutation({
    mutationFn: (amount: number) => (isDeposit ? deposit(account.id, amount) : withdraw(account.id, amount)),
    onSuccess: updated => {
      qc.setQueryData(['account', account.id], updated)
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['ledger', account.id] })
      close()
    },
  })

  function close() { setText(''); setFieldError(null); m.reset(); onClose() }

  function submit(e: FormEvent) {
    e.preventDefault()
    const r = parseAmount(text)
    if ('error' in r) { setFieldError(r.error); return }
    if (!isDeposit && r.value > account.balance) {
      setFieldError(`You only have ${formatMoney(account.balance, account.currency)} available.`)
      return
    }
    setFieldError(null)
    m.mutate(r.value)
  }

  const verb = isDeposit ? 'Add funds' : 'Withdraw'
  return (
    <Dialog open={mode !== null} title={`${verb} · ${account.accountNumber}`} onClose={close}>
      <p className="muted small" style={{ marginBottom: 'var(--space-4)' }}>
        Demo only. This changes the balance directly and doesn't move real money.
      </p>
      {m.error && <ErrorNote error={m.error} />}
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="funds-amount">Amount ({account.currency})</label>
          <input
            id="funds-amount" className="num" inputMode="decimal" autoComplete="off" autoFocus
            placeholder="0.00" value={text} onChange={e => setText(e.target.value)}
            aria-invalid={fieldError ? true : undefined} aria-describedby={fieldError ? 'funds-err' : undefined}
          />
          {fieldError && <span id="funds-err" className="error-text">{fieldError}</span>}
          {!isDeposit && <span className="hint">Available: {formatMoney(account.balance, account.currency)}</span>}
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button className="btn btn-primary" disabled={m.isPending}>{m.isPending ? 'Working…' : verb}</button>
        </div>
      </form>
    </Dialog>
  )
}
