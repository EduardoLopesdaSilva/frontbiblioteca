import type { Reservation } from '../types'
import { buildDateTime, formatDateBR } from '../utils/dateFormat'
import { blocksSchedule, timeOverlaps } from '../utils/reservationRules'

function minutesToTime(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function ScheduleGrid({
  date,
  resourceLabel,
  reservas,
  value,
  durationHours,
  onChange,
}: {
  date: string
  resourceLabel: string
  reservas: Reservation[]
  value: string
  durationHours: number
  onChange: (startTime: string) => void
}) {
  const slots: string[] = []
  for (let m = 8 * 60; m <= 20 * 60; m += 30) slots.push(minutesToTime(m))

  const relevant = reservas.filter(
    (r) => r.date === date && r.resourceLabel === resourceLabel && blocksSchedule(r.status),
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-900">Agenda — {resourceLabel}</div>
          <div className="text-xs text-slate-600">
            Clique em um horário disponível. (Mín. 1h, duração atual: {durationHours}h)
          </div>
        </div>
        <div className="text-xs text-slate-600">Data: {formatDateBR(date)}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {slots.map((t) => {
          const blocked = relevant.some((r) => timeOverlaps(t, durationHours, r.startTime, r.durationHours))
          const selected = value === t
          const startDt = buildDateTime(date, t)
          const isPast = startDt.getTime() < Date.now() - 60_000
          const disabled = blocked || isPast

          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              disabled={disabled}
              className={[
                'rounded-md border px-2 py-2 text-xs font-semibold transition',
                selected ? 'border-senai-blue bg-senai-blue/10 text-senai-blue' : 'border-slate-200 bg-white text-slate-800',
                'hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50',
              ].join(' ')}
              aria-label={`Selecionar horário ${t}`}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}