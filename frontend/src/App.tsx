import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute, ProtectedRoute, PublicOnly } from './auth/guards'
import { AppShell } from './layout/AppShell'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { AccountDetailPage } from './pages/AccountDetailPage'
import { AccountsPage } from './pages/AccountsPage'
import { StatementPage } from './pages/StatementPage'
import { TransferDetailPage } from './pages/TransferDetailPage'
import { TransferPage } from './pages/TransferPage'
import { TransfersPage } from './pages/TransfersPage'
import { AdminAuditPage } from './pages/AdminAuditPage'
import { AdminCustomerDetailPage } from './pages/AdminCustomerDetailPage'
import { AdminCustomersPage } from './pages/AdminCustomersPage'
import { AdminReconciliationPage } from './pages/AdminReconciliationPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<AccountsPage />} />
          <Route path="accounts/:id" element={<AccountDetailPage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="transfers/:id" element={<TransferDetailPage />} />
          <Route path="accounts/:id/statement" element={<StatementPage />} />

          <Route element={<AdminRoute />}>
            <Route path="admin/customers" element={<AdminCustomersPage />} />
            <Route path="admin/customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="admin/reconciliation" element={<AdminReconciliationPage />} />
            <Route path="admin/audit" element={<AdminAuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
