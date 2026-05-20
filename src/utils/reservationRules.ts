/**
 * Regras centralizadas de reserva (frontend).
 *
 * Por que existe:
 * - Evita duplicar `overlaps` e lógica de bloqueio entre useReservas e ScheduleGrid.
 * - Garante que status encerrados (Cancelada/Finalizada) não bloqueiem novos horários.
 *
 * Integração:
 * - Importado por `hooks/useReservas.tsx` e `components/ScheduleGrid.tsx`.
 */
import type { Reservation, ReservationResourceType, ReservationStatus } from '../types'

/** Capacidade máxima por tipo de recurso (regra institucional). */
export const RESOURCE_CAPACITY: Record<ReservationResourceType, number> = {
  sala: 5,
  computador: 2,
}

/** Acima deste valor (horas) ou recorrência semanal → exige aprovação da bibliotecária. */
export const LONG_PERIOD_HOURS_THRESHOLD = 3

export function capacityFor(type: ReservationResourceType): number {
  return RESOURCE_CAPACITY[type]
}

export function isLongPeriod(durationHours: number, recurringWeekly?: boolean): boolean {
  return durationHours > LONG_PERIOD_HOURS_THRESHOLD || !!recurringWeekly
}

/**
 * Define se uma reserva ainda ocupa o horário na agenda.
 * Cancelada e Finalizada liberam o slot; Pendente/Confirmada/Em uso continuam bloqueando.
 */
export function blocksSchedule(status: ReservationStatus): boolean {
  return status !== 'Cancelada' && status !== 'Finalizada'
}

/** Verifica sobreposição entre dois intervalos no mesmo dia (HH:mm + duração em horas). */
export function timeOverlaps(
  aStart: string,
  aHours: number,
  bStart: string,
  bHours: number,
): boolean {
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
  }
  const a0 = toMinutes(aStart)
  const a1 = a0 + aHours * 60
  const b0 = toMinutes(bStart)
  const b1 = b0 + bHours * 60
  return a0 < b1 && b0 < a1
}

export function hasScheduleConflict(
  reservas: Reservation[],
  input: {
    date: string
    resourceLabel: string
    startTime: string
    durationHours: number
    excludeId?: string
  },
): boolean {
  return reservas.some(
    (r) =>
      r.id !== input.excludeId &&
      r.date === input.date &&
      r.resourceLabel === input.resourceLabel &&
      blocksSchedule(r.status) &&
      timeOverlaps(input.startTime, input.durationHours, r.startTime, r.durationHours),
  )
}
