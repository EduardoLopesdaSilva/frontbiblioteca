import { apiRequest } from './apiClient'
import type { ApiInstitution, ApiUserMe, ApiUserType } from '../types/api'

export type AuthTokenResponse = { token: string; tokenType: string }

export async function apiLogin(email: string, password: string) {
  return apiRequest<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  })
}

export async function apiRegister(payload: {
  name: string
  cpf: string
  email: string
  phone: string
  password: string
  institution: ApiInstitution
  userType: ApiUserType
  justificativa?: string
  vinculo?: string
  observacoesExtras?: string
}) {
  return apiRequest<AuthTokenResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  })
}

export async function apiMe() {
  return apiRequest<ApiUserMe>('/auth/me')
}

export async function apiRegisterBibliotecaria(payload: {
  name: string
  employeeId: string
  email: string
  phone: string
  password: string
}) {
  return apiRequest<ApiUserMe>('/auth/register-bibliotecaria', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
