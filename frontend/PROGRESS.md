# LedgerCore Frontend — Build Plan & Progress

> **Resuming after a usage limit?** Tell Claude:
> "Read `frontend/PROGRESS.md` and continue with the next unchecked phase."
> Each phase is self-contained, ends with `npm run build` passing, and updates this file.

## Stack
Vite + React 19 + TypeScript, React Router, TanStack Query. Plain CSS with design tokens (`src/styles/`). No UI kit.
Dev server on :5173 proxies `/api` to Spring Boot on :8080 (backend has CORS disabled).

Run: `cd frontend && npm install && npm run dev` (backend must be running).
Seeded admin: `admin@ledgercore.com` / `Admin@123`.

## Backend API contract (verified from source)
Auth is `Authorization: Bearer <jwt>`. Errors are JSON `{timestamp,status,error,message}`.

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /api/auth/register | public | body `{fullName,email,phoneNumber?,password(8-100)}` → `AuthResponse` (201) |
| POST | /api/auth/login | public | body `{email,password}` → `{token,tokenType,customerId,fullName,email,role}` |
| GET | /api/customers, /api/customers/{id} | any auth | returns `CustomerResponse` (no password) |
| POST | /api/accounts | any auth | body `{customerId,accountType:"SAVINGS"\|"CURRENT"}` |
| GET | /api/accounts/{id} · /number/{n} · /customer/{customerId} | any auth | `AccountResponse` |
| POST | /api/accounts/{id}/deposit · /withdraw | any auth | body `{amount}` (≥0.01, max 4 dp) |
| PATCH | /api/accounts/{id}/status | **ADMIN** | body `{status:"ACTIVE"\|"FROZEN"\|"CLOSED"}`; CLOSED is final |
| POST | /api/transfers | any auth | header `Idempotency-Key: <uuid>`; body `{sourceAccountId,targetAccountId,amount,description?}` → 201 `TransferResponse` |
| GET | /api/transfers/{id} · /account/{accountId} · /idempotency/{key} | any auth | |
| GET | /api/ledger/account/{accountId} | any auth | `LedgerEntryResponse[]` newest first |
| GET | /api/ledger/reconcile | **ADMIN** | `{balanced,totalDebits,totalCredits,discrepancy,checkedAt}` |
| GET | /api/audit-logs/user/{userId} · /entity/{type}/{id} | **ADMIN** | `{id,userId,action,entityType,entityId,details,ipAddress,createdAt}` |

Shapes: Account `{id,customerId,accountNumber,accountType,status,currency,balance,createdAt}`;
Transfer `{id,idempotencyKey,sourceAccountId,sourceAccountNumber,targetAccountId,targetAccountNumber,amount,currency,status(PENDING|COMPLETED|FAILED),description,createdAt}`;
LedgerEntry `{id,transferId,accountId,accountNumber,entryType(DEBIT|CREDIT),amount,balanceAfter,createdAt}`.
Status codes: 400 validation/bad state, 401 bad creds, 403 forbidden or inactive account, 404, 409 duplicate email, 422 insufficient funds.

## Backend gaps the UI has to work around (tell the user / fix in backend later)
1. **No ownership checks** — any logged-in user can read any account/ledger and POST a transfer from any account. UI only ever shows the logged-in user's own accounts; this is NOT real protection.
2. `POST /api/accounts` trusts `customerId` from the body. UI always sends the logged-in user's id.
3. Deposit/withdraw are open to any customer (docs say real deposits are out of scope) — UI labels them "Add funds (demo)".
4. No "list all accounts" endpoint. Admin account view = customers list + `/accounts/customer/{id}` per customer.
5. `GET /api/customers` lists everyone to any authenticated user. UI only calls it from admin screens.
6. Transfer target is by numeric account id; UI resolves an account *number* via `/accounts/number/{n}` first.
7. Audit-log endpoints are per-user / per-entity only — no global feed.

## Design direction (decided in Phase 1 — keep consistent)
Concept: **a ledger book, not a SaaS dashboard.** Cool grey-green paper, ink-blue text, tabular figures.
The signature element is the **double-entry statement**: debit and credit in separate columns with a running balance.
- Paper `#EEF1EE` · Surface `#FAFBF9` · Ink `#14202B` · Rule `#CBD3CC` · Cobalt (action) `#2447C9`
- Credit `#17744A` · Debit `#B3341F` · Frozen `#A8700B`
- Type: **Schibsted Grotesk** (UI) + **Spline Sans Mono** for amounts/account numbers only. Sentence case, no all-caps labels.
- Rules/borders carry meaning (ledger rulings); no card-grid, no gradients, no shadows beyond focus rings.
- Money is always `tabular-nums`, right aligned, formatted with `Intl.NumberFormat` (currency from account, default INR).

## Folder layout
```
frontend/src/
  api/        client.ts (fetch + error handling), types.ts, one file per resource
  auth/       AuthContext, ProtectedRoute, token storage
  components/ shared UI (Money, StatusPill, Field, Button, EmptyState, Toast…)
  layout/     AppShell, nav
  pages/      one folder per route
  lib/        format.ts, idempotency.ts
  styles/     tokens.css, base.css
```

## Phases
Mark `[x]` when done and add a short "Notes" line. Each phase must leave `npm run build` green.

- [x] **Phase 1 — Foundation**: Vite config + proxy, tokens/base CSS, typed API client, auth context (login/register/logout, token in localStorage, auto-logout on 401), routes + ProtectedRoute/AdminRoute, app shell, Login + Register pages, placeholder pages.
- [x] **Phase 2 — Accounts**: dashboard (own accounts + total), open-account dialog, account detail page (balance, status, number copy), add funds / withdraw (demo).
- [x] **Phase 3 — Transfers**: transfer form (pick source, enter recipient account number → resolve + confirm name-less summary, amount, note), idempotency key per attempt with safe retry, success receipt, error mapping (422/403/400), transfers list per account, transfer detail.
- [x] **Phase 4 — Statement**: double-entry statement per account (debit/credit columns, running balance, link to transfer), filters (type, date), CSV export.
- [x] **Phase 5 — Admin**: customers table, per-customer accounts, freeze/unfreeze/close with confirmation, reconciliation panel, audit log viewer (by user / by entity).
- [x] **Phase 6 — Polish & ship**: responsive pass (≤ 480px), keyboard/focus/aria pass, loading/empty/error states audit, Vitest tests for format + client + idempotency, README section, optional: serve built app from Spring (`dist` → `src/main/resources/static`) or Docker/nginx.

## Log
(append one line per finished phase: date, what changed, anything the next phase must know)
- 2026-11-12 Phase 1 done. `npm run build` green; login/register/logout, 401 handling and admin route guard verified against a mock backend.
  Next phase should know: `api<T>(path, opts)` in `src/api/client.ts` prepends `/api`, adds the Bearer token, throws `ApiError(status, message)`.
  `useSession()` gives `{customerId, fullName, email, role, token}`. Shared bits live in `components/ui.tsx` (Money, StatusPill, EmptyState, ErrorNote, PageHeader).
  Routes are in `src/App.tsx` as `<Placeholder>`s — replace each as its phase is built. Layout/shell CSS is `styles/layout.css`; add page CSS to new files and import in `main.tsx`.
  Fonts load from Google Fonts in `tokens.css` (swap to self-hosted if the app must work offline).
- 2026-11-12 Phase 2 done. Build green; verified against a stateful mock (list, open account, add funds, withdraw, validation, frozen note, foreign/404 account).
  Next phase should know: `api/accounts.ts` has `getAccount`, `getAccountByNumber` (use it to resolve the recipient in Phase 3), `listAccountsForCustomer`, `updateAccountStatus` (Phase 5).
  React Query keys: `['accounts', customerId]` list, `['account', id]` detail, `['ledger', id]` (invalidated by funds dialog; Phase 4 should use this key). After a transfer, invalidate `['accounts']`, `['account', sourceId]`, `['account', targetId]`, `['ledger', id]`.
  Reusable: `components/Dialog.tsx` (native <dialog>), `lib/amount.ts` `parseAmount()` (use for transfer amount), `FundsDialog` pattern for forms in dialogs. Account detail already links to `/transfer?from=<id>` and `/accounts/:id/statement`.
  Detail page hides foreign accounts for non-admins (UI-only; backend gap #1 still open).
- 2026-11-12 Phases 3+4 done (backend untouched, as requested). Build green. Verified on a mock that mimics backend idempotency: first send committed but the connection dropped → UI showed the safe-retry message → "Try again" resent the SAME key → exactly 1 transfer executed. Also verified: unknown/frozen/same/over-balance recipient checks, transfers list, statement filters, CSV, 404 pages, no horizontal overflow at 390px on any page.
  Added: `pages/TransferPage.tsx` (form → review → receipt; `lib/idempotency.ts` `createKeyKeeper()` = one key per distinct request, new key when any detail changes), `pages/TransfersPage.tsx`, `pages/TransferDetailPage.tsx` (route `/transfers/:id`), `pages/StatementPage.tsx`, `components/TransferReceipt.tsx`, `lib/csv.ts` (formula-injection-safe CSV + download), `lib/useMyAccounts.ts`, `api/transfers.ts`, `api/ledger.ts`.
  Query keys now in use: `['accounts', customerId]`, `['account', id]`, `['transfer', id]`, `['transfers','account',accountId]`, `['ledger', accountId]`. Mutations invalidate by prefix.
  Gateway errors (0/502/503/504) are treated as "outcome unknown, safe to retry" in TransferPage `explain()`.
  Known backend facts surfaced in UI: deposit/withdraw don't write ledger entries, so the statement shows a notice when the latest ledger `balanceAfter` differs from the account balance. Ledger entries have no note/counterparty, so the statement joins them to `/transfers/account/{id}` by transferId.
  CSS: `styles/transfers.css` (table helpers `.table-scroll`, `.nowrap`, receipt) and `styles/statement.css`. Wrap every new table in `.table-scroll` and keep `.main { min-width: 0 }` or phones overflow.
  Phase 5 needs: admin pages reuse `PageHeader`, `.ledger` tables, `Dialog`. Admin customers → `GET /api/customers`, per-customer accounts → `listAccountsForCustomer`, status change → `updateAccountStatus` (invalidate `['account', id]` and `['accounts']`).
- 2026-11-12 Phases 5+6 done — **ALL PHASES COMPLETE.** Backend untouched.
  Phase 5: `api/admin.ts`; pages `AdminCustomersPage`, `AdminCustomerDetailPage` (accounts + status actions + audit link), `AdminReconciliationPage` (always refetches, staleTime 0), `AdminAuditPage` (by customer or by record, `?user=<id>` deep link); `components/StatusActions.tsx` (freeze / reactivate / close with confirm dialog; Close is disabled while balance > 0 because docs/account-lifecycle.md requires a zero balance and the backend doesn't enforce it); admin panel also shown on `/accounts/:id` for admins. Removed `Placeholder.tsx`.
  Phase 6: light/dark theme toggle (`lib/theme.ts`, persisted, defaults to OS setting, applied before first paint), `ErrorBoundary`, per-page document titles (`lib/useTitle.ts`), 32 Vitest tests (`npm test`: amount parsing, formatting, CSV safety, idempotency keys, API client incl. 401/403 session handling), Windows-friendly README with nginx deploy example.
  Verified on a mock backend: admin + customer flows end to end; axe-core WCAG 2.0/2.1 A+AA scan = 0 violations on 16 page/dialog states incl. dark mode; no horizontal overflow at 390px on 9 pages; no JS errors; `npm run build` and `npm test` green.
  NOT verified: anything against the real Spring Boot + PostgreSQL (sandbox has neither). First real-run checks: (1) login as admin, (2) the audit `details`/`createdAt` shapes, (3) `/api/ledger/reconcile` when the ledger is empty — backend `sumAllDebits()` may return null/0; UI tolerates null.
  Not done on purpose (would require backend changes): serving the build from Spring, ownership enforcement, global audit feed, list-all-accounts endpoint.
