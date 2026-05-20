/**
 * Painel "Horários vagos" — visão operacional para admin.
 * Lista slots livres no dia/recurso selecionados.
 */
import { useMemo } from 'react'
import type { Reservation, ReservationResourceType } from '../../types'
import { buildDateTime, formatDateBR } from '../../utils/dateFormat'
import { blocksSchedule, timeOverlaps } from '../../utils/reservationRules'

function slots() {
  const out: string[] = []
  for (let m = 8 * 60; m <= 20 * 60; m += 30) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return out
}

export default function AvailableHoursPanel({
  date,
  resourceLabel,
  resourceType,
  reservas,
  durationHours,
  onPick,
}: {
  date: string
  resourceLabel: string
  resourceType: ReservationResourceType
  reservas: Reservation[]
  durationHours: number
  onPick: (time: string) => void
}) {
  const free = useMemo(() => {
    const booked = reservas.filter(
      (r) =>
        r.date === date &&
        r.resourceLabel === resourceLabel &&
        r.resourceType === resourceType &&
        blocksSchedule(r.status),
    )
    return slots().filter((t) => {
      const start = buildDateTime(date, t)
      if (start.getTime() < Date.now() - 60_000) return false
      return !booked.some((r) => timeOverlaps(t, durationHours, r.startTime, r.durationHours))
    })
  }, [date, resourceLabel, resourceType, reservas, durationHours])

  return (
    <div className="rounded-xl border-2 border-senai-blue/30 bg-white p-4 shadow-card">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-senai-blue">Horários vagos</h3>
      <p className="mt-1 text-xs text-slate-600">
        {formatDateBR(date)} · {resourceLabel} · duração {durationHours}h
      </p>
      {free.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Nenhum horário livre neste período.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {free.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
