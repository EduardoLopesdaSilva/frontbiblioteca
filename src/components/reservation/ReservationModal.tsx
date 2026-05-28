/**
 * Modal reutilizável: formulário + termo obrigatório antes de confirmar reserva.
 */
import { useEffect, useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import type { ReservationResourceType } from '../../types'
import Button from '../Button'
import Input from '../Input'
import Modal from '../Modal'
import Select from '../Select'

export type ReservationFormState = {
  date: string
  startTime: string
  durationHours: number
  peopleCount: number
  recurringWeekly: boolean
  resourceType: ReservationResourceType
  resourceLabel: string
}

export default function ReservationModal({
  open,
  onClose,
  form,
  onFormChange,
  resourceOptions,
  maxPeople,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  form: ReservationFormState
  onFormChange: (patch: Partial<ReservationFormState>) => void
  resourceOptions: string[]
  maxPeople: number
  onConfirm: (termAccepted: boolean) => void
  loading?: boolean
}) {
  const [termAccepted, setTermAccepted] = useState(false)

  useEffect(() => {
    if (open) setTermAccepted(false)
  }, [open])

  return (
    <Modal
      open={open}
      title="Nova reserva"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            loading={loading}
            disabled={!termAccepted}
            onClick={() => onConfirm(termAccepted)}
          >
            <FaCheck aria-hidden="true" /> Confirmar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Data" type="date" value={form.date} onValueChange={(date) => onFormChange({ date })} />
        <Input
          label="Horário início"
          value={form.startTime}
          onValueChange={(startTime) => onFormChange({ startTime })}
        />
        <Input
          label="Duração (horas)"
          type="number"
          min={1}
          value={String(form.durationHours)}
          onValueChange={(v) => onFormChange({ durationHours: Math.max(1, Number(v || 1)) })}
        />
        <Input
          label={`Pessoas (máx. ${maxPeople})`}
          type="number"
          min={1}
          max={maxPeople}
          value={String(form.peopleCount)}
          onValueChange={(v) =>
            onFormChange({ peopleCount: Math.min(maxPeople, Math.max(1, Number(v || 1))) })
          }
        />
        <Select
          label="Recurso"
          value={form.resourceLabel}
          onChange={(e) => onFormChange({ resourceLabel: e.target.value })}
          options={resourceOptions.map((x) => ({ value: x, label: x }))}
        />
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.recurringWeekly}
            onChange={(e) => onFormChange({ recurringWeekly: e.target.checked })}
            className="h-4 w-4 accent-senai-blue"
          />
          <span>Reserva recorrente semanal (exige aprovação da bibliotecária)</span>
        </label>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Termo de Responsabilidade</p>
        <p>
          Declaro uso responsável do espaço/equipamento, respeitando capacidade, silêncio e normas da biblioteca.
        </p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={termAccepted}
            onChange={(e) => setTermAccepted(e.target.checked)}
            className="h-4 w-4 accent-senai-blue"
          />
          <span className="font-semibold">Li e aceito o termo</span>
        </label>
      </div>
    </Modal>
  )
}
