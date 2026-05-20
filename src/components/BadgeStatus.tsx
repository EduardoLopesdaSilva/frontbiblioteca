import type { ReservationStatus } from '../types'

const classes: Record<ReservationStatus, string> = {
  Confirmada: 'bg-senai-blue/10 text-senai-blue border-senai-blue/30',
  Pendente: 'bg-amber-50 text-amber-800 border-amber-200',
  Cancelada: 'bg-senai-red/10 text-senai-red border-senai-red/30',
  'Em uso': 'bg-slate-900/5 text-slate-900 border-slate-300',
  Finalizada: 'bg-emerald-50 text-emerald-800 border-emerald-200',
}

export default function BadgeStatus({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        classes[status],
      ].join(' ')}
    >
      {status}
    </span>
  )
}

