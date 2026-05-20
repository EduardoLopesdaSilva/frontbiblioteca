import type { ApiReservation, ApiReservationStatus, ApiResource, ApiUserMe, ApiUserType } from '../types/api'
import type {
  Institution,
  Reservation,
  ReservationResourceType,
  ReservationStatus,
  ResourceItem,
  UserProfile,
  UserTypeLabel,
} from '../types'
import { addMinutes, buildDateTime, pad2, toISODate } from './dateFormat'
import { isLongPeriod } from './reservationRules'

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
  const start = new Date(r.startAt)
  const end = new Date(r.endAt)
  const durationHours = Math.max(1, Math.round((end.getTime() - start.getTime()) / 3_600_000))
  const status = mapApiStatus(r.status)

  return {
    id: r.id,
    createdAt: r.startAt,
    createdBy: r.userId,
    createdByName: r.userName,
    resourceType: mapResourceTypeFromApi(r.resourceType),
    resourceLabel: r.resourceName,
    resourceId: r.resourceId,
    date: toISODate(start),
    startTime: `${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
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
