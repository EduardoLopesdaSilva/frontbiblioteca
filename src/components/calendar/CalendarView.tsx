/**
 * Agenda visual — foco principal do sistema (dia / semana / mês).
 * Integra com reservas existentes e permite clique para nova reserva.
 */
import { useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import type { CalendarViewMode, Reservation, ReservationResourceType } from '../../types'
import { buildDateTime, formatDateBR, pad2, toISODate } from '../../utils/dateFormat'
import { blocksSchedule, timeOverlaps } from '../../utils/reservationRules'
import BadgeStatus from '../BadgeStatus'
import Button from '../Button'
import ToggleTabs from '../ToggleTabs'

const SLOT_START = 8
const SLOT_END = 20
const SLOT_STEP = 30

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

function startOfWeek(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

function monthDays(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0)
  const days: string[] = []
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(`${y}-${pad2(m)}-${pad2(d)}`)
  }
  return days
}

function slotsForDay() {
  const out: string[] = []
  for (let m = SLOT_START * 60; m <= SLOT_END * 60; m += SLOT_STEP) {
    out.push(`${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`)
  }
  return out
}

export default function CalendarView({
  reservas,
  resourceLabel,
  resourceType,
  selectedDate,
  onDateChange,
  durationHours,
  onSlotClick,
  isAdmin,
}: {
  reservas: Reservation[]
  resourceLabel: string
  resourceType: ReservationResourceType
  selectedDate: string
  onDateChange: (date: string) => void
  durationHours: number
  onSlotClick: (date: string, time: string) => void
  isAdmin?: boolean
}) {
  const [view, setView] = useState<CalendarViewMode>('day')
  const slots = useMemo(() => slotsForDay(), [])

  const relevant = useMemo(
    () =>
      reservas.filter(
        (r) =>
          r.resourceLabel === resourceLabel &&
          r.resourceType === resourceType &&
          blocksSchedule(r.status),
      ),
    [reservas, resourceLabel, resourceType],
  )

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [selectedDate])

  const daysInMonth = useMemo(() => monthDays(selectedDate), [selectedDate])

  function reservationsOn(date: string) {
    return relevant.filter((r) => r.date === date)
  }

  function isSlotFree(date: string, time: string) {
    const startDt = buildDateTime(date, time)
    if (startDt.getTime() < Date.now() - 60_000) return false
    return !reservationsOn(date).some((r) => timeOverlaps(time, durationHours, r.startTime, r.durationHours))
  }

  const viewTabs = useMemo(
    () => [
      { key: 'day' as const, label: 'Dia', description: 'Grade horária' },
      { key: 'week' as const, label: 'Semana', description: '7 dias' },
      { key: 'month' as const, label: 'Mês', description: 'Visão mensal' },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleTabs value={view} onChange={setView} tabs={viewTabs} />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="px-2 py-1.5"
            onClick={() =>
              onDateChange(
                addDays(selectedDate, view === 'month' ? -30 : view === 'week' ? -7 : -1),
              )
            }
          >
            <FaChevronLeft aria-hidden="true" />
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-bold text-slate-800">
            {view === 'month'
              ? selectedDate.slice(0, 7)
              : view === 'week'
                ? `${formatDateBR(weekDays[0])} – ${formatDateBR(weekDays[6])}`
                : formatDateBR(selectedDate)}
          </span>
          <Button
            variant="secondary"
            className="px-2 py-1.5"
            onClick={() =>
              onDateChange(addDays(selectedDate, view === 'month' ? 30 : view === 'week' ? 7 : 1))
            }
          >
            <FaChevronRight aria-hidden="true" />
          </Button>
          <Button variant="secondary" className="text-xs" onClick={() => onDateChange(toISODate(new Date()))}>
            Hoje
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-600">
        {resourceLabel} • {isAdmin ? 'Modo administrador' : 'Clique em horário livre para reservar'}
      </p>

      {view === 'day' ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {slots.map((t) => {
            const free = isSlotFree(selectedDate, t)
            const booked = reservationsOn(selectedDate).find((r) =>
              timeOverlaps(t, durationHours, r.startTime, r.durationHours),
            )
            return (
              <button
                key={t}
                type="button"
                disabled={!free && !booked}
                onClick={() => free && onSlotClick(selectedDate, t)}
                className={[
                  'rounded-md border px-2 py-2 text-xs font-semibold transition',
                  booked
                    ? 'border-senai-red/40 bg-senai-red/10 text-senai-red cursor-default'
                    : free
                      ? 'border-slate-200 bg-white hover:border-senai-blue hover:bg-senai-blue/5'
                      : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed',
                ].join(' ')}
              >
                <div>{t}</div>
                {booked ? <div className="mt-0.5 truncate text-[10px]">{booked.status}</div> : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {view === 'week' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-xs">
            <thead className="bg-senai-gray">
              <tr>
                <th className="p-2 text-left">Horário</th>
                {weekDays.map((d) => (
                  <th key={d} className="p-2 text-center font-semibold text-senai-blue">
                    {formatDateBR(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((t) => (
                <tr key={t} className="border-t border-slate-100">
                  <td className="p-2 font-medium text-slate-700">{t}</td>
                  {weekDays.map((d) => {
                    const free = isSlotFree(d, t)
                    const booked = reservationsOn(d).find((r) =>
                      timeOverlaps(t, durationHours, r.startTime, r.durationHours),
                    )
                    return (
                      <td key={d} className="p-1">
                        <button
                          type="button"
                          disabled={!free && !booked}
                          onClick={() => free && onSlotClick(d, t)}
                          className={[
                            'h-8 w-full rounded text-[10px]',
                            booked ? 'bg-senai-red/15 text-senai-red' : free ? 'bg-emerald-50 hover:bg-senai-blue/10' : 'bg-slate-50',
                          ].join(' ')}
                          title={booked ? `${booked.status} — ${booked.createdByName}` : free ? 'Disponível' : 'Indisponível'}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === 'month' ? (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {daysInMonth.map((d) => {
            const list = reservationsOn(d)
            const isSelected = d === selectedDate
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onDateChange(d)
                  setView('day')
                }}
                className={[
                  'min-h-[4.5rem] rounded-lg border p-1 text-left text-[10px] transition sm:min-h-[5.5rem] sm:p-2 sm:text-xs',
                  isSelected ? 'border-senai-blue bg-senai-blue/10' : 'border-slate-200 bg-white hover:border-senai-blue/50',
                ].join(' ')}
              >
                <div className="font-bold text-slate-900">{d.slice(8)}</div>
                <div className="mt-1 space-y-0.5">
                  {list.slice(0, 2).map((r) => (
                    <div key={r.id} className="truncate rounded bg-slate-100 px-1 py-0.5">
                      {r.startTime} {r.status}
                    </div>
                  ))}
                  {list.length > 2 ? <div className="text-slate-500">+{list.length - 2}</div> : null}
                </div>
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-slate-200 bg-white" /> Livre
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-senai-red/15" /> Reservado
        </span>
      </div>

      {view === 'day' && reservationsOn(selectedDate).length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900">Reservas do dia</h4>
          {reservationsOn(selectedDate).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
              <span className="font-semibold">
                {r.startTime} · {r.durationHours}h
              </span>
              <BadgeStatus status={r.status} />
              <span className="text-slate-600">{r.createdByName}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
