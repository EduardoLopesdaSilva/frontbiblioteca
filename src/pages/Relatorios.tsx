import { useEffect, useMemo, useState } from 'react'
import ReportCard from '../components/reports/ReportCard'
import Card from '../components/Card'
import * as reportApi from '../services/reportApi'
import Select from '../components/Select'
import Input from '../components/Input'
import BadgeStatus from '../components/BadgeStatus'
import type { ReservationStatus, ReservationResourceType } from '../types'
import { useReservas } from '../hooks/useReservas'
import { formatDateBR } from '../utils/dateFormat'

const statusOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'Confirmada', label: 'Confirmada' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Cancelada', label: 'Cancelada' },
  { value: 'Em uso', label: 'Em uso' },
  { value: 'Finalizada', label: 'Finalizada' },
]

export default function Relatorios() {
  const { reservas } = useReservas()
  const [apiStats, setApiStats] = useState<{
    occupation?: Awaited<ReturnType<typeof reportApi.apiOccupationReport>>
    reservations?: Awaited<ReturnType<typeof reportApi.apiReservationReport>>
    users?: Awaited<ReturnType<typeof reportApi.apiUserReport>>
  }>({})

  useEffect(() => {
    void (async () => {
      try {
        const [occupation, reservations, users] = await Promise.all([
          reportApi.apiOccupationReport(),
          reportApi.apiReservationReport(),
          reportApi.apiUserReport(),
        ])
        setApiStats({ occupation, reservations, users })
      } catch {
        /* mantém relatório local se API indisponível */
      }
    })()
  }, [])

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState<'ALL' | ReservationResourceType>('ALL')
  const [status, setStatus] = useState<'ALL' | ReservationStatus>('ALL')
  const [userQuery, setUserQuery] = useState('')

  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      if (from && r.date < from) return false
      if (to && r.date > to) return false
      if (type !== 'ALL' && r.resourceType !== type) return false
      if (status !== 'ALL' && r.status !== status) return false
      if (userQuery && !r.createdByName.toLowerCase().includes(userQuery.toLowerCase())) return false
      return true
    })
  }, [from, reservas, status, to, type, userQuery])

  const totals = useMemo(() => {
    const byType = { sala: 0, computador: 0 }
    const byStatus: Record<string, number> = {}
    for (const r of filtered) {
      byType[r.resourceType]++
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
    }
    return { byType, byStatus, total: filtered.length }
  }, [filtered])

  return (
    <div className="container-page py-10 space-y-6">
      {apiStats.occupation ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ReportCard
            title="Ocupação salas"
            value={`${apiStats.occupation.salaUsagePercent.toFixed(0)}%`}
            hint="Indicador analítico do período"
          />
          <ReportCard
            title="Ocupação PCs"
            value={`${apiStats.occupation.computadorUsagePercent.toFixed(0)}%`}
          />
          <ReportCard title="Reservas (API)" value={apiStats.reservations?.total ?? 0} />
          <ReportCard title="Usuários ativos" value={apiStats.users?.activeUsers ?? 0} accent="red" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Total">
          <div className="text-3xl font-extrabold text-slate-900">{totals.total}</div>
          <div className="text-sm text-slate-600">reservas no filtro</div>
        </Card>
        <Card title="Salas">
          <div className="text-3xl font-extrabold text-slate-900">{totals.byType.sala}</div>
          <div className="text-sm text-slate-600">reservas</div>
        </Card>
        <Card title="Computadores">
          <div className="text-3xl font-extrabold text-slate-900">{totals.byType.computador}</div>
          <div className="text-sm text-slate-600">reservas</div>
        </Card>
        <Card title="Pendentes">
          <div className="text-3xl font-extrabold text-slate-900">{totals.byStatus['Pendente'] ?? 0}</div>
          <div className="text-sm text-slate-600">aguardando aprovação</div>
        </Card>
      </div>

      <Card title="Filtros">
        <div className="grid gap-4 md:grid-cols-5">
          <Input label="Data inicial" type="date" value={from} onValueChange={setFrom} />
          <Input label="Data final" type="date" value={to} onValueChange={setTo} />
          <Select
            label="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: 'ALL', label: 'Todos' },
              { value: 'sala', label: 'Sala' },
              { value: 'computador', label: 'Computador' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={statusOptions}
          />
          <Input label="Usuário" value={userQuery} onValueChange={setUserQuery} placeholder="Nome contém..." />
        </div>
      </Card>

      <Card title="Resultados">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-2 pr-4">Data/Hora</th>
                <th className="py-2 pr-4">Recurso</th>
                <th className="py-2 pr-4">Usuário</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered
                .slice()
                .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
                .map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2 pr-4">
                      <div className="font-semibold text-slate-900">{formatDateBR(r.date)}</div>
                      <div className="text-xs text-slate-600">
                        {r.startTime} • {r.durationHours}h
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="font-semibold text-slate-900">{r.resourceLabel}</div>
                      <div className="text-xs text-slate-600">{r.resourceType === 'sala' ? 'Sala' : 'Computador'}</div>
                    </td>
                    <td className="py-2 pr-4">{r.createdByName}</td>
                    <td className="py-2 pr-4">
                      <BadgeStatus status={r.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-600">Nenhum resultado com os filtros atuais.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
