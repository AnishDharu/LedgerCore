import type { ReactNode } from 'react'
import { formatMoney, titleCase } from '../lib/format'
import { useTitle } from '../lib/useTitle'

export function Money({ value, currency, className = '' }: { value: number; currency?: string; className?: string }) {
  return <span className={`num ${className}`}>{formatMoney(value, currency)}</span>
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`pill ${status.toLowerCase()}`}>{titleCase(status)}</span>
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
    </div>
  )
}

export function ErrorNote({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : 'Something went wrong.'
  return <div className="alert" role="alert">{msg}</div>
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  useTitle(title)
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {children && <div className="page-actions">{children}</div>}
    </header>
  )
}
