import { FaCheckCircle, FaClock, FaDoorOpen, FaTimesCircle } from 'react-icons/fa'
import type { Reservation } from '../types'
import { formatDateBR } from '../utils/dateFormat'
import BadgeStatus from './BadgeStatus'
import Button from './Button'

export default function ReservationCard({
  r,
  canManage,
  canCheckIn,
  canCheckOut,
  onCheckIn,
  onCheckOut,
  onCancel,
  onApprove,
  onReject,
}: {
  r: Reservation
  canManage: boolean
  canCheckIn: boolean
  canCheckOut: boolean
  onCheckIn: (id: string) => void
  onCheckOut: (id: string) => void
  onCancel: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {r.resourceLabel} • {r.resourceType === 'sala' ? 'Sala de Estudo' : 'Computador'}
            </h3>
            <BadgeStatus status={r.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1">
              <FaClock aria-hidden="true" /> {formatDateBR(r.date)} • {r.startTime} • {r.durationHours}h
            </span>
            <span>Qtd. pessoas: {r.peopleCount}</span>
            <span>Usuário: {r.createdByName}</span>
            {r.requiresApproval ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                Período longo/fixo
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {r.status === 'Pendente' && canManage && onApprove && onReject ? (
          <>
            <Button variant="primary" className="px-3 py-1.5" onClick={() => onApprove(r.id)}>
              <FaCheckCircle aria-hidden="true" /> Aprovar
            </Button>
            <Button variant="danger" className="px-3 py-1.5" onClick={() => onReject(r.id)}>
              <FaTimesCircle aria-hidden="true" /> Rejeitar
            </Button>
          </>
        ) : null}

        <Button
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => onCheckIn(r.id)}
          disabled={!canCheckIn}
        >
          <FaDoorOpen aria-hidden="true" /> Check-in
        </Button>

        <Button
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => onCheckOut(r.id)}
          disabled={!canCheckOut}
        >
          <FaCheckCircle aria-hidden="true" /> Check-out
        </Button>

        {canManage ? (
          <Button variant="danger" className="ml-auto px-3 py-1.5" onClick={() => onCancel(r.id)}>
            <FaTimesCircle aria-hidden="true" /> Cancelar
          </Button>
        ) : null}
      </div>
    </div>
  )
}

