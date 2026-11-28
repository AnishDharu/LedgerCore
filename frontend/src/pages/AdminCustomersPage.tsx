import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listCustomers } from '../api/admin'
import { EmptyState, ErrorNote, PageHeader } from '../components/ui'
import { formatDate, titleCase } from '../lib/format'

export function AdminCustomersPage() {
  const nav = useNavigate()
  const [term, setTerm] = useState('')
  const q = useQuery({ queryKey: ['customers'], queryFn: listCustomers })

  const rows = useMemo(() => {
    const t = term.trim().toLowerCase()
    const all = q.data ?? []
    return t ? all.filter(c => c.fullName.toLowerCase().includes(t) || c.email.toLowerCase().includes(t)) : all
  }, [q.data, term])

  return (
    <>
      <PageHeader title="Customers" />
      {q.isPending && <div className="skeleton" style={{ height: 200 }} aria-label="Loading customers" />}
      {q.isError && <ErrorNote error={q.error} />}
      {q.data && (
        <>
          <div className="field filter-one">
            <label htmlFor="cust-search">Search by name or email</label>
            <input id="cust-search" type="search" value={term} onChange={e => setTerm(e.target.value)} autoComplete="off" />
          </div>
          {rows.length === 0 ? (
            <EmptyState title={term ? 'No customers match that search' : 'No customers yet'}>
              {term ? 'Check the spelling or clear the search.' : 'Customers appear here after they register.'}
            </EmptyState>
          ) : (
            <div className="table-scroll">
              <table className="ledger">
                <caption className="sr-only">{rows.length} customers</caption>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
                <tbody>
                  {rows.map(c => (
                    <tr key={c.id} className="row-link" onClick={() => nav(`/admin/customers/${c.id}`)}>
                      <td><Link className="plain" to={`/admin/customers/${c.id}`} onClick={e => e.stopPropagation()}><strong>{c.fullName}</strong></Link></td>
                      <td className="wrap-any">{c.email}</td>
                      <td>{titleCase(c.role)}</td>
                      <td>{c.active ? <span className="pill active">Active</span> : <span className="pill closed">Inactive</span>}</td>
                      <td className="nowrap">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
