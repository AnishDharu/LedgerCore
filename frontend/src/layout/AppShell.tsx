import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { applyTheme, initialTheme, type Theme } from '../lib/theme'

export function AppShell() {
  const { session, isAdmin, signOut } = useAuth()
  const [theme, setTheme] = useState<Theme>(() => initialTheme())
  const flip = () => { const next: Theme = theme === 'dark' ? 'light' : 'dark'; setTheme(next); applyTheme(next) }
  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <aside className="rail">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 7v18h14" fill="none" stroke="currentColor" strokeWidth="3.5"/><path d="M15 12h8M15 17h8" stroke="var(--cobalt)" strokeWidth="3.5"/></svg>
          LedgerCore
        </div>
        <nav aria-label="Main">
          <NavLink to="/" end>Accounts</NavLink>
          <NavLink to="/transfer">Send money</NavLink>
          <NavLink to="/transfers">Transfers</NavLink>
          {isAdmin && (
            <>
              <div className="nav-group">Administration</div>
              <NavLink to="/admin/customers">Customers</NavLink>
              <NavLink to="/admin/reconciliation">Reconciliation</NavLink>
              <NavLink to="/admin/audit">Audit log</NavLink>
            </>
          )}
        </nav>
        <div className="who">
          <div className="who-name">{session?.fullName}</div>
          <div className="muted who-email">{session?.email}</div>
          <div className="who-actions">
            <button className="btn btn-quiet who-out" onClick={signOut}>Sign out</button>
            <button className="btn btn-quiet who-out" onClick={flip}>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</button>
          </div>
        </div>
      </aside>
      <main id="main" className="main">
        <Outlet />
      </main>
    </div>
  )
}
