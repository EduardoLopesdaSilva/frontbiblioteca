import type { ApiCalendarSlot, ApiReservation, ApiReservationStatus, ApiResource, ApiUserMe, ApiUserType } from '../types/api'
import type {
  Institution,
  Reservation,
  ReservationResourceType,
  ReservationStatus,
  ResourceItem,
  UserProfile,
  UserTypeLabel,
} from '../types'
import { addMinutes, buildDateTime, pad2 } from './dateFormat'
import { isLongPeriod } from './reservationRules'

/** Interpreta LocalDateTime da API sem conversão de fuso (evita data/hora erradas no calendário). */
/** Compara IDs de usuário/reserva ignorando maiúsculas e espaços. */
export function sameUserId(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function parseApiLocalDateTime(iso: string) {
  const normalized = iso.length >= 19 ? iso.slice(0, 19) : iso
  const [datePart, timePart = '00:00:00'] = normalized.split('T')
  const [hh, mm] = timePart.split(':')
  return { date: datePart, time: `${pad2(Number(hh))}:${pad2(Number(mm))}` }
}

/** Exibe Finalizada quando o período terminou (somente visual; persistência via check-out). */
export function applyVisualReservationStatus(r: Reservation, now = new Date()): Reservation {
  if (r.status !== 'Em uso') return r
  const end = addMinutes(buildDateTime(r.date, r.startTime), r.durationHours * 60)
  if (now.getTime() > end.getTime()) {
    return { ...r, status: 'Finalizada' }
  }
  return r
}

const STATUS_FROM_API: Record<ApiReservationStatus, ReservationStatus> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Confirmada',
  REJEITADA: 'Cancelada',
  EM_USO: 'Em uso',
  CONCLUIDA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

const STATUS_TO_API: Record<ReservationStatus, ApiReservationStatus> = {
  Pendente: 'PENDENTE',
  Confirmada: 'APROVADA',
  Cancelada: 'CANCELADA',
  'Em uso': 'EM_USO',
  Finalizada: 'CONCLUIDA',
}

const USER_TYPE_FROM_API: Record<ApiUserType, UserTypeLabel> = {
  ALUNO: 'Aluno',
  COLABORADOR: 'Colaborador',
  TERCEIRO: 'Terceiros',
  BIBLIOTECARIA: 'Colaborador',
}

const USER_TYPE_TO_API: Record<UserTypeLabel, ApiUserType> = {
  Aluno: 'ALUNO',
  Colaborador: 'COLABORADOR',
  Terceiros: 'TERCEIRO',
}

export function mapApiStatus(status: ApiReservationStatus): ReservationStatus {
  return STATUS_FROM_API[status]
}

export function mapStatusToApi(status: ReservationStatus): ApiReservationStatus {
  return STATUS_TO_API[status]
}

export function mapUserTypeToApi(type: UserTypeLabel): ApiUserType {
  return USER_TYPE_TO_API[type]
}

export function mapResourceTypeFromApi(type: ApiResource['resourceType']): ReservationResourceType {
  return type === 'SALA_ESTUDO' ? 'sala' : 'computador'
}

export function mapApiResource(r: ApiResource): ResourceItem {
  return {
    id: r.id,
    name: r.name,
    resourceType: mapResourceTypeFromApi(r.resourceType),
    maxCapacity: r.maxCapacity,
    active: r.active,
    available: r.available,
  }
}

export function toLocalDateTimeString(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  )
}

export function toApiPeriod(date: string, startTime: string, durationHours: number) {
  const start = buildDateTime(date, startTime)
  const end = addMinutes(start, durationHours * 60)
  return { startAt: toLocalDateTimeString(start), endAt: toLocalDateTimeString(end) }
}

export function mapApiReservation(r: ApiReservation): Reservation {
  const start = parseApiLocalDateTime(r.startAt)
  const end = parseApiLocalDateTime(r.endAt)
  const startDt = buildDateTime(start.date, start.time)
  const endDt = buildDateTime(end.date, end.time)
  const durationHours = Math.max(1, Math.round((endDt.getTime() - startDt.getTime()) / 3_600_000))
  const status = mapApiStatus(r.status)

  return {
    id: r.id,
    createdAt: r.startAt,
    createdBy: r.userId,
    createdByName: r.userName,
    resourceType: mapResourceTypeFromApi(r.resourceType),
    resourceLabel: r.resourceName,
    resourceId: r.resourceId,
    date: start.date,
    startTime: start.time,
    durationHours,
    peopleCount: r.peopleCount,
    status,
    requiresApproval: status === 'Pendente' || isLongPeriod(durationHours, r.recurringWeekly),
    recurringWeekly: r.recurringWeekly,
    termAccepted: r.termAccepted,
    checkInAt: r.checkInAt ?? undefined,
    checkOutAt: r.checkOutAt ?? undefined,
  }
}

/** Mapeia slot do calendário compartilhado (sem expor dados pessoais de terceiros). */
export function mapApiCalendarSlot(r: ApiCalendarSlot): Reservation {
  const start = parseApiLocalDateTime(r.startAt)
  const end = parseApiLocalDateTime(r.endAt)
  const startDt = buildDateTime(start.date, start.time)
  const endDt = buildDateTime(end.date, end.time)
  const durationHours = Math.max(1, Math.round((endDt.getTime() - startDt.getTime()) / 3_600_000))
  const status = mapApiStatus(r.status)

  return {
    id: r.id,
    createdAt: r.startAt,
    createdBy: r.mine ? 'self' : 'other',
    createdByName: r.mine ? 'Minha reserva' : 'Ocupado',
    resourceType: mapResourceTypeFromApi(r.resourceType),
    resourceLabel: r.resourceName,
    resourceId: r.resourceId,
    date: start.date,
    startTime: start.time,
    durationHours,
    peopleCount: 1,
    status,
    requiresApproval: status === 'Pendente',
    termAccepted: true,
    isMine: r.mine,
  }
}

export function mapApiUserToProfile(me: ApiUserMe): UserProfile {
  if (me.role === 'ROLE_ADMIN' || me.userType === 'BIBLIOTECARIA') {
    return {
      role: 'admin',
      id: me.id,
      name: me.name,
      employeeId: me.employeeId ?? '—',
      email: me.email,
      phone: me.phone,
    }
  }

  return {
    role: 'user',
    id: me.id,
    name: me.name,
    cpf: me.cpf,
    email: me.email,
    phone: me.phone,
    institution: me.institution as Institution,
    type: USER_TYPE_FROM_API[me.userType],
    modality: me.modality ?? 'OUTRO',
    justificativa: me.justificativa ?? undefined,
    vinculo: me.vinculo ?? undefined,
    observacoesExtras: me.observacoesExtras ?? undefined,
    active: me.active,
  }
}

export function cpfDigits(cpf: string) {
  return cpf.replace(/\D/g, '')
}

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, '')
}
