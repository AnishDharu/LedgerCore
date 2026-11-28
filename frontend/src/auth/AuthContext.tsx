import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import type { AuthResponse, RegisterRequest } from '../api/types'
import { clearSession, loadSession, saveSession, type Session } from './storage'

interface AuthState {
  session: Session | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (req: RegisterRequest) => Promise<void>
  signOut: () => void
}

const Ctx = createContext<AuthState | null>(null)

const toSession = (r: AuthResponse): Session => ({
  token: r.token, customerId: r.customerId, fullName: r.fullName, email: r.email, role: r.role,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const qc = useQueryClient()

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
    qc.clear() // never leave one user's data cached for the next
  }, [qc])

  useEffect(() => {
    setUnauthorizedHandler(signOut)
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  const accept = useCallback((r: AuthResponse) => {
    const s = toSession(r)
    saveSession(s)
    setSession(s)
  }, [])

  const value = useMemo<AuthState>(() => ({
    session,
    isAdmin: session?.role === 'ADMIN',
    signIn: async (email, password) => accept(await authApi.login(email, password)),
    signUp: async (req) => accept(await authApi.register(req)),
    signOut,
  }), [session, accept, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>')
  return v
}

export function useSession(): Session {
  const { session } = useAuth()
  if (!session) throw new Error('useSession called while signed out')
  return session
}
