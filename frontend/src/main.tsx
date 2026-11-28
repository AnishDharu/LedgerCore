import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './auth/AuthContext'
import { ApiError } from './api/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { applyTheme, initialTheme } from './lib/theme'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/accounts.css'
import './styles/transfers.css'
import './styles/statement.css'
import './styles/admin.css'

// Set before first paint so dark-mode users don't see a light flash.
applyTheme(initialTheme(), false)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      // Don't retry 4xx — they won't change. Retry network blips once.
      retry: (count, err) => !(err instanceof ApiError && err.status >= 400) && count < 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
