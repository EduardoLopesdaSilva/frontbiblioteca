import { apiRequest } from './apiClient'
import type { ApiReservation, ApiReservationStatus } from '../types/api'

export async function apiListMyReservations() {
  return apiRequest<ApiReservation[]>('/reservations/me')
}

export async function apiListAllReservations() {
  return apiRequest<ApiReservation[]>('/reservations')
}

export async function apiCreateReservation(payload: {
  resourceId: string
  startAt: string
  endAt: string
  peopleCount: number
  termAccepted: boolean
  recurringWeekly: boolean
}) {
  return apiRequest<ApiReservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function apiUpdateReservation(
  id: string,
  payload: {
    resourceId: string
    startAt: string
    endAt: string
    peopleCount: number
    recurringWeekly: boolean
  },
) {
  return apiRequest<ApiReservation>(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function apiUpdateReservationStatus(id: string, status: ApiReservationStatus) {
  return apiRequest<ApiReservation>(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function apiCheckIn(id: string) {
  return apiRequest<ApiReservation>(`/reservations/${id}/checkin`, { method: 'POST' })
}

export async function apiCheckOut(id: string) {
  return apiRequest<ApiReservation>(`/reservations/${id}/checkout`, { method: 'POST' })
}
