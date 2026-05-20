import type { Reservation, ReservationResourceType } from '../types'

export const SALAS = ['Sala 01', 'Sala 02', 'Sala 03', 'Sala 04'] as const
export const COMPUTADORES = [
  'Computador 01',
  'Computador 02',
  'Computador 03',
  'Computador 04',
  'Computador 05',
] as const

export function filterByResource(
  reservas: Reservation[],
  resourceType: ReservationResourceType,
  date?: string,
) {
  return reservas.filter(
    (r) => r.resourceType === resourceType && (!date || r.date === date),
  )
}

