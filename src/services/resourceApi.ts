import { apiRequest } from './apiClient'
import type { ApiResource } from '../types/api'

export async function apiListResources(startAt?: string, endAt?: string) {
  const params = new URLSearchParams()
  if (startAt) params.set('startAt', startAt)
  if (endAt) params.set('endAt', endAt)
  const qs = params.toString()
  return apiRequest<ApiResource[]>(`/resources${qs ? `?${qs}` : ''}`, { auth: false })
}

export async function apiListResourcesAdmin(startAt?: string, endAt?: string) {
  const params = new URLSearchParams()
  if (startAt) params.set('startAt', startAt)
  if (endAt) params.set('endAt', endAt)
  const qs = params.toString()
  return apiRequest<ApiResource[]>(`/resources/all${qs ? `?${qs}` : ''}`)
}

export async function apiCreateResource(payload: {
  name: string
  resourceType: 'SALA_ESTUDO' | 'COMPUTADOR'
  maxCapacity: number
}) {
  return apiRequest<ApiResource>('/resources', { method: 'POST', body: JSON.stringify(payload) })
}

export async function apiUpdateResource(
  id: string,
  payload: { name: string; maxCapacity: number; active: boolean },
) {
  return apiRequest<ApiResource>(`/resources/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function apiSetResourceActive(id: string, active: boolean) {
  return apiRequest<ApiResource>(`/resources/${id}/active?active=${active}`, { method: 'PATCH' })
}
