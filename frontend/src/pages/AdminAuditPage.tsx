import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAuditByEntity, getAuditByUser, listCustomers } from '../api/admin'
import type { AuditLog } from '../api/types'
import { EmptyState, ErrorNote, PageHeader } from '../components/ui'
import { formatDateTime } from '../lib/format'

const ENTITY_TYPES = ['ACCOUNT', 'TRANSFER', 'CUSTOMER'] as const
type Mode = 'user' | 'entity'

function recordLink(l: AuditLog) {
  const label = `${l.entityType.toLowerCase()} #${l.entityId ?? '–'}`
  if (l.entityId == null) return <>{label}</>
  if (l.entityType === 'ACCOUNT') return <Link to={`/accounts/${l.entityId}`}>{label}</Link>
  if (l.entityType === 'TRANSFER') return <Link to={`/transfers/${l.entityId}`}>{label}</Link>
  if (l.entityType === 'CUSTOMER') return <Link to={`/admin/customers/${l.entityId}`}>{label}</Link>
  return <>{label}</>
}

export function AdminAuditPage() {
  const [params] = useSearchParams()
  const initialUser = Number(params.get('user'))
  const [mode, setMode] = useState<Mode>('user')
  const [userId, setUserId] = useState<number | ''>(Number.isInteger(initialUser) && initialUser > 0 ? initialUser : '')
  const [type, setType] = useState<string>('ACCOUNT')
  const [entityText, setEntityText] = useState('')
  const [entityId, setEntityId] = useState<number | null>(null)

  const customersQ = useQuery({ queryKey: ['customers'], queryFn: listCustomers })
  const names = useMemo(() => new Map((customersQ.data ?? []).map(c => [c.id, c.fullName])), [customersQ.data])

  const logsQ = useQuery({
    queryKey: mode === 'user' ? ['audit', 'user', userId] : ['audit', 'entity', type, entityId],
    queryFn: () => (mode === 'user' ? getAuditByUser(userId as number) : getAuditByEntity(type, entityId as number)),
    enabled: mode === 'user' ? userId !== '' : entityId !== null,
  })
  const rows = useMemo(() => [...(logsQ.data ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [logsQ.data])
  const asking = mode === 'user' ? userId !== '' : entityId !== null

  return (
    <>
      <PageHeader title="Audit log" />
      <div className="filters" role="group" aria-label="Choose what to look up">
        <div className="field">
          <label htmlFor="a-mode">Look up by</label>
          <select id="a-mode" value={mode} onChange={e => setMode(e.target.value as Mode)}>
            <option value="user">Customer</option>
            <option value="entity">Record</option>
          </select>
        </div>
        {mode === 'user' ? (
          <div className="field">
            <label htmlFor="a-user">Customer</label>
            <select id="a-user" value={userId} onChange={e => setUserId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Choose a customer…</option>
              {(customersQ.data ?? []).map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>)}
            </select>
          </div>
        ) : (
          <form className="filters" onSubmit={e => { e.preventDefault(); const n = Number(entityText); setEntityId(Number.isInteger(n) && n > 0 ? n : null) }}>
            <div className="field">
              <label htmlFor="a-type">Record type</label>
              <select id="a-type" value={type} onChange={e => { setType(e.target.value); setEntityId(null) }}>
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="a-id">Record ID</label>
              <input id="a-id" className="num" inputMode="numeric" value={entityText} onChange={e => setEntityText(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Look up</button>
          </form>
        )}
      </div>

      {!asking && <EmptyState title="Choose what to review">{mode === 'user' ? 'Pick a customer to see everything they did.' : 'Enter a record ID to see everything that happened to it.'}</EmptyState>}
      {asking && logsQ.isPending && <div className="skeleton" style={{ height: 160 }} aria-label="Loading audit log" />}
      {logsQ.isError && <ErrorNote error={logsQ.error} />}
      {asking && logsQ.data && rows.length === 0 && <EmptyState title="No audit events">Nothing has been recorded for that selection.</EmptyState>}

      {rows.length > 0 && (
        <div className="table-scroll">
          <table className="ledger">
            <caption className="sr-only">Audit events, newest first</caption>
            <thead><tr><th>When</th><th>Action</th><th>Record</th><th>By</th><th>Details</th></tr></thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.id}>
                  <td className="nowrap">{formatDateTime(l.createdAt)}</td>
                  <td><span className="num small">{l.action}</span></td>
                  <td className="nowrap">{recordLink(l)}</td>
                  <td>{l.userId == null ? <span className="muted">System</span> : (names.get(l.userId) ?? `Customer #${l.userId}`)}</td>
                  <td className="wrap-any">{l.details}{l.ipAddress && <div className="muted small">{l.ipAddress}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
