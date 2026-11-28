import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAccount } from '../api/accounts'
import type { Account, AccountType } from '../api/types'
import { useSession } from '../auth/AuthContext'
import { Dialog } from './Dialog'
import { ErrorNote } from './ui'

export function OpenAccountDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (a: Account) => void }) {
  const { customerId } = useSession()
  const qc = useQueryClient()
  const [type, setType] = useState<AccountType>('SAVINGS')

  const m = useMutation({
    // Always the signed-in user's own id — never anything typed in the UI.
    mutationFn: () => createAccount(customerId, type),
    onSuccess: acct => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      onCreated?.(acct)
      onClose()
    },
  })

  function submit(e: FormEvent) { e.preventDefault(); m.mutate() }

  return (
    <Dialog open={open} title="Open an account" onClose={() => { m.reset(); onClose() }}>
      {m.error && <ErrorNote error={m.error} />}
      <form onSubmit={submit}>
        <fieldset className="choice">
          <legend>Account type</legend>
          <label className={type === 'SAVINGS' ? 'on' : ''}>
            <input type="radio" name="type" checked={type === 'SAVINGS'} onChange={() => setType('SAVINGS')} />
            <span><strong>Savings</strong><small>For money you want to keep.</small></span>
          </label>
          <label className={type === 'CURRENT' ? 'on' : ''}>
            <input type="radio" name="type" checked={type === 'CURRENT'} onChange={() => setType('CURRENT')} />
            <span><strong>Current</strong><small>For everyday spending and business use.</small></span>
          </label>
        </fieldset>
        <p className="muted small">New accounts start active with a zero balance.</p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={m.isPending}>{m.isPending ? 'Opening…' : 'Open account'}</button>
        </div>
      </form>
    </Dialog>
  )
}
