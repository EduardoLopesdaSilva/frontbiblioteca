export type ApiResourceType = 'SALA_ESTUDO' | 'COMPUTADOR'

export type ApiInstitution = 'SESI' | 'SENAI'

export type ApiUserType = 'ALUNO' | 'COLABORADOR' | 'TERCEIRO' | 'BIBLIOTECARIA'

export type ApiReservationStatus =
  | 'PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'EM_USO'

export type ApiUserMe = {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  institution: ApiInstitution
  userType: ApiUserType
  modality: string | null
  justificativa: string | null
  vinculo: string | null
  observacoesExtras: string | null
  employeeId: string | null
  active: boolean
  role: 'ROLE_ADMIN' | 'ROLE_USER'
}

export type ApiResource = {
  id: string
  name: string
  resourceType: ApiResourceType
  maxCapacity: number
  active: boolean
  available: boolean
}

export type ApiReservation = {
  id: string
  userId: string
  userName: string
  resourceId: string
  resourceName: string
  resourceType: ApiResourceType
  startAt: string
  endAt: string
  peopleCount: number
  status: ApiReservationStatus
  termAccepted: boolean
  recurringWeekly: boolean
  checkInAt: string | null
  checkOutAt: string | null
}

/** Ocupação do calendário — sem dados pessoais. */
export type ApiCalendarSlot = {
  id: string
  resourceId: string
  resourceName: string
  resourceType: ApiResourceType
  startAt: string
  endAt: string
  status: ApiReservationStatus
  mine: boolean
}
