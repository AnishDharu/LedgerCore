import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ErrorNote } from '../components/ui'
import { useTitle } from '../lib/useTitle'

function AuthFrame({ title, children, footer }: { title: string; children: React.ReactNode; footer: React.ReactNode }) {
  useTitle(title)
  return (
    <div className="auth">
      <section className="auth-intro" aria-hidden="true">
        <div className="auth-brand">LedgerCore</div>
        <div className="auth-sheet">
          <div className="auth-row head"><span>Account</span><span>Debit</span><span>Credit</span></div>
          <div className="auth-row"><span>ACC-4821907365</span><span className="num debit">1,250.00</span><span /></div>
          <div className="auth-row"><span>ACC-7730216594</span><span /><span className="num credit">1,250.00</span></div>
          <div className="auth-row total"><span>Balanced</span><span className="num">1,250.00</span><span className="num">1,250.00</span></div>
        </div>
        <p>Every transfer posts a debit and a matching credit.</p>
      </section>
      <section className="auth-form">
        <h1>{title}</h1>
        {children}
        <p className="auth-foot muted">{footer}</p>
      </section>
    </div>
  )
}

export function LoginPage() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null)
    try { await signIn(email.trim(), password); nav(from, { replace: true }) }
    catch (err) { setError(err) }
    finally { setBusy(false) }
  }

  return (
    <AuthFrame title="Sign in" footer={<>New to LedgerCore? <Link to="/register">Create an account</Link></>}>
      {error != null && <ErrorNote error={error} />}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthFrame>
  )
}

export function RegisterPage() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ fullName: '', email: '', phoneNumber: '', password: '' })
  const [error, setError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      await signUp({ fullName: f.fullName.trim(), email: f.email.trim(), phoneNumber: f.phoneNumber.trim() || undefined, password: f.password })
      nav('/', { replace: true })
    } catch (err) { setError(err) }
    finally { setBusy(false) }
  }

  return (
    <AuthFrame title="Create your account" footer={<>Already registered? <Link to="/login">Sign in</Link></>}>
      {error != null && <ErrorNote error={error} />}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" required maxLength={120} autoComplete="name" value={f.fullName} onChange={set('fullName')} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={f.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" type="tel" maxLength={15} autoComplete="tel" value={f.phoneNumber} onChange={set('phoneNumber')} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} maxLength={100} autoComplete="new-password" value={f.password} onChange={set('password')} />
          <span className="hint">At least 8 characters.</span>
        </div>
        <button className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthFrame>
  )
}
