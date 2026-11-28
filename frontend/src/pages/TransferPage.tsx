import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getAccountByNumber } from '../api/accounts'
import { ApiError } from '../api/client'
import { executeTransfer } from '../api/transfers'
import type { Account, Transfer } from '../api/types'
import { TransferReceipt } from '../components/TransferReceipt'
import { EmptyState, ErrorNote, Money, PageHeader } from '../components/ui'
import { parseAmount } from '../lib/amount'
import { formatMoney, titleCase } from '../lib/format'
import { createKeyKeeper } from '../lib/idempotency'
import { useMyAccounts } from '../lib/useMyAccounts'

type Step = 'form' | 'review' | 'done'

function normalizeNumber(raw: string) {
  const t = raw.trim().toUpperCase().replace(/\s+/g, '')
  return /^\d{10}$/.test(t) ? `ACC-${t}` : t
}

/** Turns an API failure into something the person can act on. */
function explain(err: unknown): string {
  if (err instanceof ApiError) {
    // 0 = no response; 502/503/504 = a proxy or gateway lost the backend. In all of these we can't know
    // if the transfer committed, and resending with the same key is what makes that safe.
    if (err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504) return 'We couldn’t confirm whether this transfer went through. It’s safe to try again: the same request won’t be sent twice.'
    if (err.status === 422) return `${err.message} No money was moved.`
    return err.message
  }
  return 'Something went wrong. No money was moved.'
}

export function TransferPage() {
  const accountsQ = useMyAccounts()
  const qc = useQueryClient()
  const [params] = useSearchParams()
  const keys = useRef(createKeyKeeper()).current

  const [step, setStep] = useState<Step>('form')
  const [sourceChoice, setSourceChoice] = useState<number | null>(null)
  const [targetText, setTargetText] = useState('')
  const [amountText, setAmountText] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [recipient, setRecipient] = useState<Account | null>(null)
  const [amount, setAmount] = useState(0)
  const [done, setDone] = useState<Transfer | null>(null)

  const mine = useMemo(() => accountsQ.data ?? [], [accountsQ.data])
  const sendable = mine.filter(a => a.status === 'ACTIVE')
  const fromParam = Number(params.get('from'))
  const source = sendable.find(a => a.id === (sourceChoice ?? fromParam)) ?? sendable[0]

  const send = useMutation({
    mutationFn: () => {
      const key = keys.keyFor([source!.id, recipient!.id, amount, note.trim()])
      return executeTransfer(key, { sourceAccountId: source!.id, targetAccountId: recipient!.id, amount, description: note.trim() || undefined })
    },
    onSuccess: t => {
      keys.reset()
      setDone(t); setStep('done')
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['account'] })
      qc.invalidateQueries({ queryKey: ['transfers'] })
      qc.invalidateQueries({ queryKey: ['ledger'] })
    },
  })

  async function review(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!source) return
    const number = normalizeNumber(targetText)
    if (!number) return setFormError('Enter the recipient’s account number.')
    const parsed = parseAmount(amountText)
    if ('error' in parsed) return setFormError(parsed.error)
    if (parsed.value > source.balance) return setFormError(`You only have ${formatMoney(source.balance, source.currency)} available in ${source.accountNumber}.`)

    setChecking(true)
    try {
      const target = await getAccountByNumber(number)
      if (target.id === source.id) return setFormError('Choose a different account to send to.')
      if (target.status !== 'ACTIVE') return setFormError('That account can’t receive money right now.')
      if (target.currency !== source.currency) return setFormError(`That account uses ${target.currency}. You can only send ${source.currency} here.`)
      setRecipient(target); setAmount(parsed.value); send.reset(); setStep('review')
    } catch (err) {
      setFormError(err instanceof ApiError && err.status === 404 ? `No account found with number ${number}.` : explain(err))
    } finally { setChecking(false) }
  }

  function reset() {
    keys.reset(); send.reset()
    setStep('form'); setRecipient(null); setDone(null)
    setTargetText(''); setAmountText(''); setNote(''); setFormError(null)
  }

  if (accountsQ.isPending) return <><PageHeader title="Send money" /><div className="skeleton" style={{ height: 260 }} aria-label="Loading" /></>
  if (accountsQ.isError) return <><PageHeader title="Send money" /><ErrorNote error={accountsQ.error} /></>
  if (!source && step !== 'done') {
    return (
      <>
        <PageHeader title="Send money" />
        <EmptyState title="You need an active account first">
          {mine.length ? 'None of your accounts can send money right now.' : 'Open an account, add some funds, then come back here.'}{' '}
          <Link to="/">Go to accounts</Link>
        </EmptyState>
      </>
    )
  }

  if (step === 'done' && done) {
    return (
      <>
        <PageHeader title="Money sent" />
        <div className="alert ok" role="status">Your transfer is complete.</div>
        <TransferReceipt t={done} mine={new Set(mine.map(a => a.id))} />
        <div className="actions" style={{ marginTop: 'var(--space-5)' }}>
          <button className="btn btn-primary" onClick={reset}>Send another</button>
          <Link className="btn" to={`/accounts/${done.sourceAccountId}/statement`}>View statement</Link>
          <Link className="btn btn-quiet" to="/transfers">All transfers</Link>
        </div>
      </>
    )
  }

  if (step === 'review' && recipient && source) {
    return (
      <>
        <PageHeader title="Review transfer" />
        {send.error && <ErrorNote error={new Error(explain(send.error))} />}
        <section className="receipt" aria-label="Transfer summary">
          <div className="receipt-top"><Money value={amount} currency={source.currency} className="receipt-amount" /></div>
          <dl>
            <dt>From</dt><dd><span className="num">{source.accountNumber}</span> <span className="muted">· {titleCase(source.accountType)}, balance after {formatMoney(source.balance - amount, source.currency)}</span></dd>
            <dt>To</dt><dd><span className="num">{recipient.accountNumber}</span> <span className="muted">· {recipient.customerId === source.customerId ? 'your account' : 'another LedgerCore account'}</span></dd>
            {note.trim() && (<><dt>Note</dt><dd>{note.trim()}</dd></>)}
          </dl>
        </section>
        <p className="muted small" style={{ marginTop: 'var(--space-3)' }}>Check the account number carefully. Transfers can’t be edited or deleted once sent.</p>
        <div className="actions" style={{ marginTop: 'var(--space-5)' }}>
          <button className="btn btn-primary" disabled={send.isPending} onClick={() => send.mutate()}>
            {send.isPending ? 'Sending…' : send.error ? 'Try again' : 'Confirm and send'}
          </button>
          <button className="btn" disabled={send.isPending} onClick={() => { send.reset(); setStep('form') }}>Edit details</button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Send money" />
      <form className="transfer-form" onSubmit={review} noValidate>
        {formError && <div className="alert" role="alert">{formError}</div>}
        <div className="field">
          <label htmlFor="from">From</label>
          <select id="from" value={source!.id} onChange={e => setSourceChoice(Number(e.target.value))}>
            {sendable.map(a => (
              <option key={a.id} value={a.id}>{a.accountNumber} · {titleCase(a.accountType)} · {formatMoney(a.balance, a.currency)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="to">Recipient account number</label>
          <input id="to" className="num" autoComplete="off" spellCheck={false} placeholder="ACC-0000000000" value={targetText} onChange={e => setTargetText(e.target.value)} />
          <span className="hint">You can send to your own accounts too.</span>
        </div>
        <div className="field">
          <label htmlFor="amt">Amount ({source!.currency})</label>
          <input id="amt" className="num" inputMode="decimal" autoComplete="off" placeholder="0.00" value={amountText} onChange={e => setAmountText(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="note">Note (optional)</label>
          <input id="note" maxLength={255} value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={checking}>{checking ? 'Checking account…' : 'Review transfer'}</button>
      </form>
    </>
  )
}
