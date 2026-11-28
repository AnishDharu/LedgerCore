# LedgerCore frontend

React 19 + TypeScript + Vite. Plain CSS with design tokens, TanStack Query for data, React Router.
Phase plan, API contract and design rules: [`PROGRESS.md`](./PROGRESS.md).

## Run it (Windows, macOS, Linux)

You need **Node.js 22** (20.19+ also works) and the Spring Boot backend running on port 8080.

```bash
cd frontend          # from the LedgerCore project folder, where pom.xml lives
npm install
npm run dev
```

Open **http://localhost:5173**. (Port 8080 still serves the old Thymeleaf page.)

In dev, Vite forwards `/api` to the backend because the backend has CORS disabled.
If the backend is elsewhere: `VITE_API_TARGET=http://host:port npm run dev`
(PowerShell: `$env:VITE_API_TARGET="http://host:port"; npm run dev`).

Seeded admin: `admin@ledgercore.com` / `Admin@123`. Register any other user from the sign-up page.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | Type-check only |

## What's in it

**Customers:** register and sign in, open accounts, add funds / withdraw (demo), send money with a review step and receipt,
transfer history, per-account statement with filters and CSV export.
**Admins:** customer list, freeze / reactivate / close accounts (with confirmation), reconciliation check, audit log by customer or record.
Light and dark themes, keyboard accessible, works down to phone width.

## Deploying a production build

`npm run build` produces static files in `dist/`. Serve them from any web server and route `/api/*` to the Spring Boot app
on the same origin (the backend has CORS disabled, so same-origin is required). Example nginx:

```nginx
server {
  listen 80;
  root /var/www/ledgercore;            # contents of dist/
  location /api/ { proxy_pass http://127.0.0.1:8080; }
  location /     { try_files $uri /index.html; }   # client-side routes
}
```

## Known backend gaps (frontend can't fix these)

Listed in full in `PROGRESS.md`. The important one: the backend doesn't check account ownership, so any signed-in user
could read another user's account or move money from it by calling the API directly. The UI only shows a user their own data,
but that is not a security boundary.
