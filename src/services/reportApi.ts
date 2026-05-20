import { apiRequest } from './apiClient'

export async function apiOccupationReport(from?: string, to?: string) {
  const p = new URLSearchParams()
  if (from) p.set('from', from)
  if (to) p.set('to', to)
  const qs = p.toString()
  return apiRequest<{
    salaUsagePercent: number
    computadorUsagePercent: number
    peakHours: { hour: number; count: number }[]
    topResources: { resourceName: string; reservations: number }[]
  }>(`/reports/occupation${qs ? `?${qs}` : ''}`)
}

export async function apiRegistrationReport(period = 'month') {
  return apiRequest<{ total: number; byPeriod: Record<string, number> }>(
    `/reports/registrations?period=${period}`,
  )
}

export async function apiReservationReport(from?: string, to?: string) {
  const p = new URLSearchParams()
  if (from) p.set('from', from)
  if (to) p.set('to', to)
  const qs = p.toString()
  return apiRequest<{
    total: number
    pendentes: number
    confirmadas: number
    canceladas: number
    finalizadas: number
    recorrentes: number
  }>(`/reports/reservations${qs ? `?${qs}` : ''}`)
}

export async function apiUserReport(from?: string, to?: string) {
  const p = new URLSearchParams()
  if (from) p.set('from', from)
  if (to) p.set('to', to)
  const qs = p.toString()
  return apiRequest<{
    totalUsers: number
    activeUsers: number
    topUsers: { name: string; email: string; reservations: number }[]
  }>(`/reports/users${qs ? `?${qs}` : ''}`)
}
