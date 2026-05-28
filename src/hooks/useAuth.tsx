import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, getToken, setToken } from '../services/apiClient'
import * as authApi from '../services/authApi'
import type { UserProfile, UserRole } from '../types'
import { cpfDigits, mapApiUserToProfile, mapUserTypeToApi, phoneDigits } from '../utils/apiMappers'

type Session = {
  user: UserProfile
}

export type AuthResult = Promise<{ ok: true } | { ok: false; message: string }>

type AuthContextValue = {
  session: Session | null
  authReady: boolean
  login: (email: string, password: string) => AuthResult
  logout: () => void
  registerUser: (
    data: Omit<Extract<UserProfile, { role: 'user' }>, 'id' | 'role'> & { password: string },
  ) => AuthResult
  registerAdmin: (
    data: Omit<Extract<UserProfile, { role: 'admin' }>, 'id' | 'role'> & { password: string },
  ) => AuthResult
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadSessionFromToken(): Promise<Session | null> {
  if (!getToken()) return null
  const me = await authApi.apiMe()
  return { user: mapApiUserToProfile(me) }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const s = await loadSessionFromToken()
        setSession(s)
      } catch {
        setToken(null)
        setSession(null)
      } finally {
        setAuthReady(true)
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token } = await authApi.apiLogin(email, password)
      setToken(token)
      const s = await loadSessionFromToken()
      setSession(s)
      return { ok: true as const }
    } catch (e) {
      setToken(null)
      setSession(null)
      const message = e instanceof ApiError ? e.message : 'Não foi possível entrar. Verifique se a API está online.'
      return { ok: false as const, message }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setSession(null)
  }, [])

  const registerUser = useCallback(
    async (data: Omit<Extract<UserProfile, { role: 'user' }>, 'id' | 'role'> & { password: string }) => {
      try {
        const { token } = await authApi.apiRegister({
          name: data.name,
          cpf: cpfDigits(data.cpf),
          email: data.email,
          phone: phoneDigits(data.phone),
          password: data.password,
          institution: data.institution,
          userType: mapUserTypeToApi(data.type),
          justificativa: data.justificativa,
          vinculo: data.vinculo,
          observacoesExtras: data.observacoesExtras,
        })
        setToken(token)
        const s = await loadSessionFromToken()
        setSession(s)
        return { ok: true as const }
      } catch (e) {
        setToken(null)
        setSession(null)
        const message = e instanceof ApiError ? e.message : 'Erro ao cadastrar usuário.'
        return { ok: false as const, message }
      }
    },
    [],
  )

  const registerAdmin = useCallback(
    async (data: Omit<Extract<UserProfile, { role: 'admin' }>, 'id' | 'role'> & { password: string }) => {
      if (session?.user.role !== 'admin') {
        return {
          ok: false as const,
          message: 'Cadastro de bibliotecária permitido apenas por um administrador logado.',
        }
      }
      try {
        await authApi.apiRegisterBibliotecaria({
          name: data.name,
          employeeId: data.employeeId,
          email: data.email,
          phone: phoneDigits(data.phone),
          password: data.password,
        })
        return { ok: true as const }
      } catch (e) {
        const message = e instanceof ApiError ? e.message : 'Erro ao cadastrar bibliotecária.'
        return { ok: false as const, message }
      }
    },
    [session],
  )

  const value: AuthContextValue = useMemo(
    () => ({
      session,
      authReady,
      login,
      logout,
      registerUser,
      registerAdmin,
      hasRole(role) {
        return session?.user.role === role
      },
    }),
    [session, authReady, login, logout, registerUser, registerAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
