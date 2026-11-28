import { api } from './client'
import type { AuthResponse, RegisterRequest } from './types'

export const login = (email: string, password: string) =>
  api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true })

export const register = (req: RegisterRequest) =>
  api<AuthResponse>('/auth/register', { method: 'POST', body: req, skipAuth: true })
