import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../services/apiClient'
import * as reservationApi from '../services/reservationApi'
import { apiListResources } from '../services/resourceApi'
import type { ApiResource } from '../types/api'
import type { Reservation, ReservationResourceType, ReservationStatus, UserProfile } from '../types'
import { addMinutes, buildDateTime } from '../utils/dateFormat'
import {
  applyVisualReservationStatus,
  mapApiCalendarSlot,
  mapApiReservation,
  mapApiResource,
  mapStatusToApi,
  sameUserId,
  toApiPeriod,
} from '../utils/apiMappers'
import { capacityFor, hasScheduleConflict } from '../utils/reservationRules'
import { useAuth } from './useAuth'
import { COMPUTADORES, SALAS } from './useAgenda'

export type ReservationResult = Promise<{ ok: true } | { ok: false; message: string }>

type CreateReservationInput = {
  user: Pick<UserProfile, 'id' | 'name' | 'role'>
  resourceType: ReservationResourceType
  resourceLabel: string
  date: string
  startTime: string
  durationHours: number
  peopleCount: number
  termAccepted: boolean
  recurringWeekly?: boolean
  notes?: string
}

type ReservasContextValue = {
  reservas: Reservation[]
  /** Reservas do usuário logado (para usuário comum = mesma lista da API /me). */
  myReservas: Reservation[]
  /** Ocupação global para calendário (usuário comum: sem dados pessoais de terceiros). */
  calendarReservas: Reservation[]
  loading: boolean
  listError: string | null
  resourcesReady: boolean
  salas: readonly string[]
  computadores: readonly string[]
  resourceItems: import('../types').ResourceItem[]
  refreshReservas: () => Promise<void>
  resolveResourceId: (label: string, type: ReservationResourceType) => string | null
  createReservation: (input: CreateReservationInput) => ReservationResult
  updateReservation: (
    id: string,
    patch: Partial<
      Pick<
        Reservation,
        'resourceType' | 'resourceLabel' | 'date' | 'startTime' | 'durationHours' | 'peopleCount' | 'notes'
      >
    >,
  ) => ReservationResult
  cancelReservation: (id: string) => ReservationResult
  checkIn: (id: string) => ReservationResult
  checkOut: (id: string) => ReservationResult
  approve: (id: string) => ReservationResult
  reject: (id: string) => ReservationResult
  updateStatus: (id: string, status: ReservationStatus) => ReservationResult
  canCheckIn: (r: Reservation, now?: Date) => boolean
  canCheckOut: (r: Reservation, now?: Date) => boolean
}

function buildEnd(date: string, startTime: string, durationHours: number) {
  const start = buildDateTime(date, startTime)
  return addMinutes(start, durationHours * 60)
}

function canManageReservation(
  r: Reservation,
  actor: Pick<UserProfile, 'id' | 'role'> | undefined,
): boolean {
  if (!actor) return false
  if (actor.role === 'admin') return true
  return sameUserId(r.createdBy, actor.id)
}

function resourceNames(resources: ApiResource[], type: ReservationResourceType) {
  const apiType = type === 'sala' ? 'SALA_ESTUDO' : 'COMPUTADOR'
  const names =
    resources.filter((r) => r.resourceType === apiType && r.active).map((r) => r.name)
  return names.length > 0 ? names : type === 'sala' ? [...SALAS] : [...COMPUTADORES]
}

const ReservasContext = createContext<ReservasContextValue | null>(null)

export function ReservasProvider({ children }: { children: React.ReactNode }) {
  const { session, authReady } = useAuth()
  const [reservas, setReservas] = useState<Reservation[]>([])
  const [calendarOccupancy, setCalendarOccupancy] = useState<Reservation[]>([])
  const [resources, setResources] = useState<ApiResource[]>([])
  const [resourceItems, setResourceItems] = useState<import('../types').ResourceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [resourcesReady, setResourcesReady] = useState(false)

  const refreshReservas = useCallback(async () => {
    if (!authReady) return

    if (!session) {
      setReservas([])
      setCalendarOccupancy([])
      setListError(null)
      return
    }

    setLoading(true)
    try {
      if (session.user.role === 'admin') {
        const list = await reservationApi.apiListAllReservations()
        if (!Array.isArray(list)) {
          throw new ApiError('Resposta inválida da API ao listar reservas.', 500)
        }
        const mapped = list.map((item) => applyVisualReservationStatus(mapApiReservation(item)))
        setReservas(mapped)
        setCalendarOccupancy(mapped)
      } else {
        const [mine, calendar] = await Promise.all([
          reservationApi.apiListMyReservations(),
          reservationApi.apiListCalendarOccupancy(),
        ])
        if (!Array.isArray(mine) || !Array.isArray(calendar)) {
          throw new ApiError('Resposta inválida da API ao listar reservas.', 500)
        }
        setReservas(mine.map((item) => applyVisualReservationStatus(mapApiReservation(item))))
        setCalendarOccupancy(
          calendar.map((item) => applyVisualReservationStatus(mapApiCalendarSlot(item))),
        )
      }
      setListError(null)
    } catch (e) {
      console.error(e)
      const message =
        e instanceof ApiError ? e.message : 'Não foi possível carregar as reservas. Verifique se a API está online.'
      setListError(message)
    } finally {
      setLoading(false)
    }
  }, [session, authReady])

  useEffect(() => {
    void (async () => {
      try {
        const list = await apiListResources()
        setResources(list)
        setResourceItems(list.map(mapApiResource))
      } catch (e) {
        console.error('Falha ao carregar recursos:', e)
        setResources([])
      } finally {
        setResourcesReady(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!authReady) return
    void refreshReservas()
  }, [authReady, refreshReservas])

  /** Atualização periódica da ocupação do calendário durante a sessão. */
  useEffect(() => {
    if (!authReady || !session) return
    const timer = window.setInterval(() => void refreshReservas(), 60_000)
    return () => window.clearInterval(timer)
  }, [authReady, session, refreshReservas])

  const resolveResourceId = useCallback(
    (label: string, type: ReservationResourceType) => {
      const apiType = type === 'sala' ? 'SALA_ESTUDO' : 'COMPUTADOR'
      return resources.find((r) => r.name === label && r.resourceType === apiType)?.id ?? null
    },
    [resources],
  )

  const salas = useMemo(() => resourceNames(resources, 'sala'), [resources])
  const computadores = useMemo(() => resourceNames(resources, 'computador'), [resources])

  const myReservas = useMemo(() => {
    if (!session) return []
    if (session.user.role === 'admin') return reservas
    return reservas.filter((r) => sameUserId(r.createdBy, session.user.id))
  }, [reservas, session])

  const calendarReservas = useMemo(() => {
    if (!session) return []
    return session.user.role === 'admin' ? reservas : calendarOccupancy
  }, [session, reservas, calendarOccupancy])

  const value: ReservasContextValue = useMemo(() => {
    const actor = session?.user

    const canCheckIn = (r: Reservation, now = new Date()) => {
      if (r.status !== 'Confirmada') return false
      const start = buildDateTime(r.date, r.startTime)
      const end = buildEnd(r.date, r.startTime, r.durationHours)
      const enableAt = addMinutes(start, -5)
      return now.getTime() >= enableAt.getTime() && now.getTime() <= end.getTime()
    }

    const canCheckOut = (r: Reservation, now = new Date()) => {
      if (r.status !== 'Em uso') return false
      const start = buildDateTime(r.date, r.startTime)
      const end = buildEnd(r.date, r.startTime, r.durationHours)
      return now.getTime() >= start.getTime() && now.getTime() <= end.getTime()
    }

    const wrap = async (fn: () => Promise<void>): ReservationResult => {
      try {
        await fn()
        await refreshReservas()
        return { ok: true }
      } catch (e) {
        const message =
          e instanceof ApiError ? e.message : 'Erro ao comunicar com o servidor. A API está rodando?'
        return { ok: false, message }
      }
    }

    const mergeCreatedReservation = (created: Awaited<ReturnType<typeof reservationApi.apiCreateReservation>>) => {
      if (!created || !session) return
      const mapped = applyVisualReservationStatus(mapApiReservation(created))
      setReservas((prev) => {
        const without = prev.filter((p) => p.id !== mapped.id)
        return [mapped, ...without]
      })
      if (session.user.role !== 'admin') {
        const slot = applyVisualReservationStatus(
          mapApiCalendarSlot({
            id: created.id,
            resourceId: created.resourceId,
            resourceName: created.resourceName,
            resourceType: created.resourceType,
            startAt: created.startAt,
            endAt: created.endAt,
            status: created.status,
            mine: true,
          }),
        )
        setCalendarOccupancy((prev) => {
          const without = prev.filter((p) => p.id !== slot.id)
          return [slot, ...without]
        })
      }
    }

    return {
      reservas,
      myReservas,
      calendarReservas,
      loading,
      listError,
      resourcesReady,
      salas,
      computadores,
      resourceItems,
      refreshReservas,
      resolveResourceId,
      canCheckIn,
      canCheckOut,
      async createReservation(input) {
        if (!resourcesReady) {
          return { ok: false, message: 'Aguarde o carregamento dos recursos antes de confirmar a reserva.' }
        }
        if (!input.termAccepted) return { ok: false, message: 'É obrigatório aceitar o Termo de Responsabilidade.' }
        if (!input.resourceLabel?.trim()) {
          return { ok: false, message: 'Selecione um recurso (sala ou computador).' }
        }
        if (input.durationHours < 1) return { ok: false, message: 'A duração mínima é de 1 hora.' }

        const cap = capacityFor(input.resourceType)
        if (input.peopleCount < 1 || input.peopleCount > cap) {
          return { ok: false, message: `Capacidade inválida. Limite: ${cap} pessoa(s).` }
        }

        const start = buildDateTime(input.date, input.startTime)
        if (start.getTime() < Date.now() - 60_000) {
          return { ok: false, message: 'Não é possível reservar para um horário no passado.' }
        }

        const resourceId = resolveResourceId(input.resourceLabel, input.resourceType)
        if (!resourceId) {
          return {
            ok: false,
            message:
              'Recurso não encontrado na API. Verifique se o backend está online (porta 8080) e com recursos cadastrados.',
          }
        }

        const conflictSource = actor?.role === 'admin' ? reservas : calendarOccupancy
        if (
          hasScheduleConflict(conflictSource, {
            date: input.date,
            resourceLabel: input.resourceLabel,
            startTime: input.startTime,
            durationHours: input.durationHours,
          })
        ) {
          return { ok: false, message: 'Horário indisponível. Já existe reserva neste período.' }
        }

        const period = toApiPeriod(input.date, input.startTime, input.durationHours)
        return wrap(async () => {
          const created = await reservationApi.apiCreateReservation({
            resourceId,
            ...period,
            peopleCount: input.peopleCount,
            termAccepted: input.termAccepted,
            recurringWeekly: !!input.recurringWeekly,
          })
          mergeCreatedReservation(created)
        })
      },
      async updateReservation(id, patch) {
        const current = reservas.find((x) => x.id === id)
        if (!current) return { ok: false, message: 'Reserva não encontrada.' }
        if (!canManageReservation(current, actor)) {
          return { ok: false, message: 'Você não tem permissão para alterar esta reserva.' }
        }

        const next = { ...current, ...patch }
        if (next.durationHours < 1) return { ok: false, message: 'A duração mínima é de 1 hora.' }
        const cap = capacityFor(next.resourceType)
        if (next.peopleCount < 1 || next.peopleCount > cap) {
          return { ok: false, message: `Capacidade inválida. Limite: ${cap} pessoa(s).` }
        }

        const resourceId =
          resolveResourceId(next.resourceLabel, next.resourceType) ?? current.resourceId
        if (!resourceId) return { ok: false, message: 'Recurso não encontrado.' }

        const period = toApiPeriod(next.date, next.startTime, next.durationHours)
        return wrap(async () => {
          await reservationApi.apiUpdateReservation(id, {
            resourceId,
            ...period,
            peopleCount: next.peopleCount,
            recurringWeekly: !!next.recurringWeekly,
          })
        })
      },
      async cancelReservation(id) {
        const current = reservas.find((x) => x.id === id)
        if (!current) return { ok: false, message: 'Reserva não encontrada.' }
        if (!canManageReservation(current, actor)) {
          return { ok: false, message: 'Você não tem permissão para cancelar esta reserva.' }
        }
        return wrap(async () => {
          if (actor?.role === 'admin') {
            await reservationApi.apiUpdateReservationStatus(id, 'CANCELADA')
          } else {
            await reservationApi.apiCancelMyReservation(id)
          }
        })
      },
      async updateStatus(id, status) {
        if (actor?.role !== 'admin') return { ok: false, message: 'Apenas bibliotecária pode alterar status.' }
        return wrap(async () => {
          await reservationApi.apiUpdateReservationStatus(id, mapStatusToApi(status))
        })
      },
      async approve(id) {
        if (actor?.role !== 'admin') return { ok: false, message: 'Apenas bibliotecária pode aprovar.' }
        return wrap(async () => {
          await reservationApi.apiUpdateReservationStatus(id, 'APROVADA')
        })
      },
      async reject(id) {
        if (actor?.role !== 'admin') return { ok: false, message: 'Apenas bibliotecária pode rejeitar.' }
        return wrap(async () => {
          await reservationApi.apiUpdateReservationStatus(id, 'REJEITADA')
        })
      },
      async checkIn(id) {
        const r = reservas.find((x) => x.id === id)
        if (!r) return { ok: false, message: 'Reserva não encontrada.' }
        if (!canManageReservation(r, actor)) {
          return { ok: false, message: 'Você não tem permissão para fazer check-in desta reserva.' }
        }
        if (!canCheckIn(r)) {
          return { ok: false, message: 'Check-in disponível apenas 5 minutos antes do início.' }
        }
        return wrap(async () => {
          await reservationApi.apiCheckIn(id)
        })
      },
      async checkOut(id) {
        const r = reservas.find((x) => x.id === id)
        if (!r) return { ok: false, message: 'Reserva não encontrada.' }
        if (!canManageReservation(r, actor)) {
          return { ok: false, message: 'Você não tem permissão para fazer check-out desta reserva.' }
        }
        if (!canCheckOut(r)) {
          return { ok: false, message: 'Check-out manual disponível apenas durante o período em uso.' }
        }
        return wrap(async () => {
          await reservationApi.apiCheckOut(id)
        })
      },
    }
  }, [
    reservas,
    myReservas,
    calendarReservas,
    calendarOccupancy,
    session,
    loading,
    listError,
    resourcesReady,
    salas,
    computadores,
    resourceItems,
    refreshReservas,
    resolveResourceId,
  ])

  return <ReservasContext.Provider value={value}>{children}</ReservasContext.Provider>
}

export function useReservas() {
  const ctx = useContext(ReservasContext)
  if (!ctx) throw new Error('useReservas deve ser usado dentro de <ReservasProvider>')
  return ctx
}
