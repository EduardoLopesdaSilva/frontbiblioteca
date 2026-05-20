export type UserRole = 'user' | 'admin'

/** Instituição (regra orientadora). */
export type Institution = 'SESI' | 'SENAI'

/** Tipo de usuário no cadastro. */
export type UserTypeLabel = 'Aluno' | 'Colaborador' | 'Terceiros'

export type UserProfile =
  | {
      role: 'user'
      id: string
      name: string
      cpf: string
      email: string
      phone: string
      institution: Institution
      type: UserTypeLabel
      modality: string
      justificativa?: string
      vinculo?: string
      observacoesExtras?: string
      active: boolean
    }
  | {
      role: 'admin'
      id: string
      name: string
      employeeId: string
      email: string
      phone: string
    }

export type ReservationStatus =
  | 'Confirmada'
  | 'Pendente'
  | 'Cancelada'
  | 'Em uso'
  | 'Finalizada'

export type ReservationResourceType = 'sala' | 'computador'

export type CalendarViewMode = 'day' | 'week' | 'month'

export type Reservation = {
  id: string
  createdAt: string
  createdBy: string
  createdByName: string
  resourceType: ReservationResourceType
  resourceLabel: string
  resourceId?: string
  date: string
  startTime: string
  durationHours: number
  peopleCount: number
  status: ReservationStatus
  requiresApproval: boolean
  recurringWeekly?: boolean
  termAccepted: boolean
  checkInAt?: string
  checkOutAt?: string
  notes?: string
}

export type ResourceItem = {
  id: string
  name: string
  resourceType: ReservationResourceType
  maxCapacity: number
  active: boolean
  available: boolean
}
