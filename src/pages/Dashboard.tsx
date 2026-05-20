import { useEffect, useMemo, useState } from 'react'
import { FaClipboardList, FaClock, FaPlus } from 'react-icons/fa'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import ReservationCard from '../components/ReservationCard'
import AvailableHoursPanel from '../components/calendar/AvailableHoursPanel'
import CalendarView from '../components/calendar/CalendarView'
import ReservationModal, { type ReservationFormState } from '../components/reservation/ReservationModal'
import Select from '../components/Select'
import ToggleTabs from '../components/ToggleTabs'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'
import type { ReservationResourceType } from '../types'
import { toISODate } from '../utils/dateFormat'

type ResourceTab = 'sala' | 'computador'

export default function Dashboard() {
  const { session } = useAuth()
  const {
    reservas,
    salas,
    computadores,
    createReservation,
    cancelReservation,
    canCheckIn,
    canCheckOut,
    checkIn,
    checkOut,
  } = useReservas()

  const user = session!.user
  const isAdmin = user.role === 'admin'

  const [tab, setTab] = useState<ResourceTab>('sala')
  const [date, setDate] = useState(toISODate(new Date()))
  const [resourceLabel, setResourceLabel] = useState<string>('')
  const [durationHours, setDurationHours] = useState(1)
  const [peopleCount, setPeopleCount] = useState(1)
  const [recurringWeekly, setRecurringWeekly] = useState(false)
  const [startTime, setStartTime] = useState('08:00')

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ReservationFormState>({
    date: toISODate(new Date()),
    startTime: '08:00',
    durationHours: 1,
    peopleCount: 1,
    recurringWeekly: false,
    resourceType: 'sala',
    resourceLabel: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const cap = tab === 'sala' ? 5 : 2

  const tabs = useMemo(
    () => [
      { key: 'sala' as const, label: 'Salas de Estudo', description: 'Capacidade até 5 pessoas' },
      { key: 'computador' as const, label: 'Computadores', description: 'Capacidade até 2 pessoas' },
    ],
    [],
  )

  const resources = tab === 'sala' ? salas : computadores

  useEffect(() => {
    if (!resourceLabel && resources.length > 0) setResourceLabel(resources[0])
  }, [resources, resourceLabel])

  const filtered = useMemo(() => {
    const base = isAdmin ? reservas : reservas.filter((r) => r.createdBy === user.id)
    return base.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [isAdmin, reservas, user.id])

  function openModal(patch?: Partial<ReservationFormState>) {
    setError(null)
    setSuccess(null)
    setForm((f) => ({
      ...f,
      date,
      resourceType: tab,
      resourceLabel,
      durationHours,
      peopleCount,
      recurringWeekly,
      startTime,
      ...patch,
    }))
    setModalOpen(true)
  }

  async function confirmCreate(termAccepted: boolean) {
    setSaving(true)
    const result = await createReservation({
      user,
      resourceType: form.resourceType,
      resourceLabel: form.resourceLabel,
      date: form.date,
      startTime: form.startTime,
      durationHours: form.durationHours,
      peopleCount: form.peopleCount,
      termAccepted,
      recurringWeekly: form.recurringWeekly,
    })
    setSaving(false)
    if (result.ok === false) {
      setError(result.message)
      return
    }
    setModalOpen(false)
    setSuccess(
      form.recurringWeekly || form.durationHours > 3
        ? 'Reserva criada como Pendente (aguardando aprovação da bibliotecária).'
        : 'Reserva confirmada com sucesso.',
    )
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert title="OK">{success}</Alert> : null}

          <Card title="Reservar (Agenda)">
            <div className="space-y-4">
              <ToggleTabs
                value={tab}
                onChange={(v: ResourceTab) => {
                  setTab(v)
                  setResourceLabel(v === 'sala' ? salas[0] ?? '' : computadores[0] ?? '')
                  setPeopleCount(1)
                }}
                tabs={tabs}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Data" type="date" value={date} onValueChange={setDate} />
                <Select
                  label={tab === 'sala' ? 'Sala' : 'Computador'}
                  value={resourceLabel}
                  onChange={(e) => setResourceLabel(e.target.value)}
                  options={resources.map((r) => ({ value: r, label: r }))}
                />
                <Input
                  label="Duração (horas)"
                  type="number"
                  min={1}
                  value={String(durationHours)}
                  onValueChange={(v) => setDurationHours(Math.max(1, Number(v || 1)))}
                  hint="Período longo (> 3h) fica Pendente."
                />
                <Input
                  label={`Qtd. pessoas (máx. ${cap})`}
                  type="number"
                  min={1}
                  max={cap}
                  value={String(peopleCount)}
                  onValueChange={(v) => setPeopleCount(Math.min(cap, Math.max(1, Number(v || 1))))}
                />
                <div className="md:col-span-2 flex items-end gap-3">
                  <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={recurringWeekly}
                      onChange={(e) => setRecurringWeekly(e.target.checked)}
                      className="h-4 w-4 accent-senai-blue"
                    />
                    <span>Reserva fixa (recorrência semanal) → Pendente</span>
                  </label>
                  <Button
                    className="ml-auto"
                    onClick={() =>
                      openModal({
                        date,
                        resourceType: tab,
                        resourceLabel,
                        durationHours,
                        peopleCount,
                        recurringWeekly,
                        startTime,
                      })
                    }
                  >
                    <FaPlus aria-hidden="true" /> Reservar
                  </Button>
                </div>
              </div>

              <CalendarView
                reservas={reservas}
                resourceLabel={resourceLabel}
                resourceType={tab}
                selectedDate={date}
                onDateChange={setDate}
                durationHours={durationHours}
                isAdmin={isAdmin}
                onSlotClick={(d, t) => {
                  setDate(d)
                  setStartTime(t)
                  openModal({ date: d, startTime: t, resourceType: tab, resourceLabel })
                }}
              />

              <Alert title="Regras ativas na reserva">
                <ul className="list-inside list-disc space-y-1">
                  <li>Capacidade: salas (5) / computadores (2)</li>
                  <li>Reserva mínima: 1 hora</li>
                  <li>Período longo/fixo: duração &gt; 3h ou recorrência semanal → Pendente</li>
                </ul>
              </Alert>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {isAdmin ? (
            <AvailableHoursPanel
              date={date}
              resourceLabel={resourceLabel}
              resourceType={tab}
              reservas={reservas}
              durationHours={durationHours}
              onPick={(t) => {
                setStartTime(t)
                openModal({ startTime: t })
              }}
            />
          ) : null}

          <Card title={isAdmin ? 'Reservas (todas)' : 'Minhas reservas'} actions={<FaClipboardList aria-hidden="true" />}>
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-700">
                  Nenhuma reserva ainda.
                </div>
              ) : (
                filtered.slice(0, 10).map((r) => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    canManage={isAdmin || r.createdBy === user.id}
                    canCheckIn={canCheckIn(r)}
                    canCheckOut={canCheckOut(r)}
                    onCancel={async (id) => {
                      const res = await cancelReservation(id)
                      if (res.ok === false) setError(res.message)
                      else setSuccess('Reserva cancelada.')
                    }}
                    onCheckIn={async (id) => {
                      const res = await checkIn(id)
                      if (res.ok === false) setError(res.message)
                      else setSuccess('Check-in realizado. Status: Em uso.')
                    }}
                    onCheckOut={async (id) => {
                      const res = await checkOut(id)
                      if (res.ok === false) setError(res.message)
                      else setSuccess('Check-out realizado. Status: Finalizada.')
                    }}
                  />
                ))
              )}
              {filtered.length > 10 ? (
                <div className="text-xs text-slate-600">Mostrando 10 de {filtered.length} (ver mais nas áreas Admin/Relatórios).</div>
              ) : null}
            </div>
          </Card>

          <Card title="Check-in / Check-out">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <FaClock className="mt-0.5 text-senai-blue" aria-hidden="true" />
              <div>
                <div>
                  Check-in somente <strong>5 minutos antes</strong> do horário inicial.
                </div>
                <div>
                  Check-out manual disponível apenas durante o período <strong>Em uso</strong>. Ao final do período, o
                  status é finalizado automaticamente (visual).
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        resourceOptions={resources}
        maxPeople={cap}
        loading={saving}
        onConfirm={confirmCreate}
      />
    </div>
  )
}
