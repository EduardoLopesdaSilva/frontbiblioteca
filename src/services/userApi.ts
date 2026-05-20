import { apiRequest } from './apiClient'
import type { ApiInstitution, ApiUserType } from '../types/api'

export type ApiUserAdmin = {
  id: string
  name: string
  email: string
  phone: string
  userType: ApiUserType
  institution: ApiInstitution
  active: boolean
  reservationCount: number
  createdAt: string
}

export async function apiListUsers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiRequest<ApiUserAdmin[]>(`/admin/users${qs}`)
}
