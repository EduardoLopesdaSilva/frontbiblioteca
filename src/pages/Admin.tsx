import { useMemo, useState } from 'react'
import { FaCheck, FaEdit, FaPlus, FaTimes } from 'react-icons/fa'
import Alert from '../components/Alert'
import BadgeStatus from '../components/BadgeStatus'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import ReservationCard from '../components/ReservationCard'
import Select from '../components/Select'
import ToggleTabs from '../components/ToggleTabs'
import { useAuth } from '../hooks/useAuth'
import { useReservas } from '../hooks/useReservas'
import AdminResourcesPanel from '../components/admin/AdminResourcesPanel'
import AdminUsersPanel from '../components/admin/AdminUsersPanel'
import type { Institution, Reservation, ReservationResourceType, UserTypeLabel } from '../types'
import { maskPhone } from '../utils/maskPhone'
import { maskCPF } from '../utils/maskCPF'
import { isValidEmail, required, validateCPF } from '../utils/validateForms'

type Tab = 'crud' | 'aprovacoes' | 'recursos' | 'usuarios'

const timeOptions = Array.from({ length: 25 }, (_, i) => {
  const m = 8 * 60 + i * 30
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
})

export default function Admin() {
  const { session, registerUser } = useAuth()
  const {
    reservas,
    salas,
    computadores,
    cancelReservation,
    approve,
    reject,
    updateReservation,
    createReservation,
  } = useReservas()

  const [tab, setTab] = useState<Tab>('crud')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // criação manual de reserva
  const [cUserName, setCUserName] = useState('')
  const [cType, setCType] = useState<ReservationResourceType>('sala')
  const [cLabel, setCLabel] = useState<string>('')
  const [cDate, setCDate] = useState('')
  const [cStart, setCStart] = useState('08:00')
  const [cDuration, setCDuration] = useState(1)
  const [cPeople, setCPeople] = useState(1)
  const [cRecurring, setCRecurring] = useState(false)
  const [cTermOpen, setCTermOpen] = useState(false)
  const [cTermAccepted, setCTermAccepted] = useState(false)

  // edição
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [eType, setEType] = useState<ReservationResourceType>('sala')
  const [eLabel, setELabel] = useState<string>('')
  const [eDate, setEDate] = useState('')
  const [eStart, setEStart] = useState('08:00')
  const [eDuration, setEDuration] = useState(1)
  const [ePeople, setEPeople] = useState(1)
  const [eNotes, setENotes] = useState('')

  // usuário externo
  const [uName, setUName] = useState('')
  const [uCpf, setUCpf] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [uPassword, setUPassword] = useState('')
  const [uPhone, setUPhone] = useState('')
  const [uInstitution, setUInstitution] = useState<Institution>('SENAI')
  const [uType, setUType] = useState<UserTypeLabel>('Aluno')
  const [uJustificativa, setUJustificativa] = useState('')
  const [uVinculo, setUVinculo] = useState('')

  const tabs = useMemo(
    () => [
      { key: 'crud' as const, label: 'Reservas (CRUD)', description: 'Criar/editar/cancelar (qualquer usuário)' },
      { key: 'aprovacoes' as const, label: 'Aprovação', description: 'Períodos longos/fixos pendentes' },
      { key: 'recursos' as const, label: 'Recursos', description: 'CRUD salas e computadores' },
      { key: 'usuarios' as const, label: 'Usuários', description: 'Listagem e cadastro' },
    ],
    [],
  )

  const pendentes = useMemo(() => reservas.filter((r) => r.status === 'Pendente'), [reservas])

  function openEdit(r: Reservation) {
    setError(null)
    setSuccess(null)
    setEditing(r)
    setEType(r.resourceType)
    setELabel(r.resourceLabel)
    setEDate(r.date)
    setEStart(r.startTime)
    setEDuration(r.durationHours)
    setEPeople(r.peopleCount)
    setENotes(r.notes ?? '')
    setEditOpen(true)
  }

  return (
    <div className="container-page py-10 space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert title="OK">{success}</Alert> : null}

      <Card title="Área Administrativa — Bibliotecária (Admin)">
        <div className="text-sm text-slate-700">
          Usuária logada: <strong>{session?.user.name}</strong> • Permissões: <strong>Admin</strong>
        </div>
      </Card>

      <ToggleTabs value={tab} onChange={setTab} tabs={tabs} />

      {tab === 'crud' ? (
        <div className="space-y-4">
          <Card title="Criar reserva (manual)">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Usuário (nome)"
                value={cUserName}
                onValueChange={setCUserName}
                placeholder="Ex.: João da Silva"
              />
              <Select
                label="Tipo"
                value={cType}
                onChange={(e) => {
                  const v = e.target.value as ReservationResourceType
                  setCType(v)
                  setCLabel(v === 'sala' ? salas[0] ?? '' : computadores[0] ?? '')
                  setCPeople(1)
                }}
                options={[
                  { value: 'sala', label: 'Sala' },
                  { value: 'computador', label: 'Computador' },
                ]}
              />
              <Select
                label="Recurso"
                value={cLabel}
                onChange={(e) => setCLabel(e.target.value)}
                options={(cType === 'sala' ? salas : computadores).map((x) => ({ value: x, label: x }))}
              />
              <Select
                label="Horário"
                value={cStart}
                onChange={(e) => setCStart(e.target.value)}
                options={timeOptions.map((t) => ({ value: t, label: t }))}
              />
              <Input label="Data" type="date" value={cDate} onValueChange={setCDate} />
              <Input
                label="Duração (horas)"
                type="number"
                min={1}
                value={String(cDuration)}
                onValueChange={(v) => setCDuration(Math.max(1, Number(v || 1)))}
                hint="> 3h ou recorrência semanal → Pendente"
              />
              <Input
                label={`Qtd. pessoas (limite: ${cType === 'sala' ? 5 : 2})`}
                type="number"
                min={1}
                value={String(cPeople)}
                onValueChange={(v) => setCPeople(Math.min(cType === 'sala' ? 5 : 2, Math.max(1, Number(v || 1))))}
              />
              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={cRecurring}
                  onChange={(e) => setCRecurring(e.target.checked)}
                  className="h-4 w-4 accent-senai-blue"
                />
                <span>Reserva fixa (recorrência semanal)</span>
              </label>

              <div className="md:col-span-2 flex justify-end">
                <Button
                  onClick={() => {
                    setError(null)
                    setSuccess(null)
                    if (!required(cUserName)) return setError('Informe o nome do usuário.')
                    if (!required(cDate)) return setError('Informe a data.')
                    setCTermAccepted(false)
                    setCTermOpen(true)
                  }}
                >
                  <FaPlus aria-hidden="true" /> Criar reserva
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Reservas (CRUD)">
            <div className="space-y-3">
            {reservas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-700">
                Nenhuma reserva ainda.
              </div>
            ) : (
              reservas.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-slate-900">{r.resourceLabel}</div>
                        <BadgeStatus status={r.status} />
                      </div>
                      <div className="mt-1 text-xs text-slate-700">
                        {r.date} • {r.startTime} • {r.durationHours}h • {r.peopleCount} pessoa(s) • Usuário:{' '}
                        {r.createdByName}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="px-3 py-1.5" onClick={() => openEdit(r)}>
                        <FaEdit aria-hidden="true" /> Editar
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-1.5"
                        onClick={() => {
                          void (async () => {
                            const res = await cancelReservation(r.id)
                            if (res.ok === false) setError(res.message)
                            else setSuccess('Reserva cancelada.')
                          })()
                        }}
                      >
                        <FaTimes aria-hidden="true" /> Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        </div>
      ) : null}

      {tab === 'aprovacoes' ? (
        <Card title="Aprovação de Períodos Longos">
          <div className="space-y-3">
            {pendentes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-700">
                Nenhuma reserva pendente.
              </div>
            ) : (
              pendentes.map((r) => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  canManage={true}
                  canCheckIn={false}
                  canCheckOut={false}
                  onCancel={() => {
                    void (async () => {
                      const res = await cancelReservation(r.id)
                      if (res.ok === false) setError(res.message)
                      else setSuccess('Reserva cancelada.')
                    })()
                  }}
                  onCheckIn={() => {}}
                  onCheckOut={() => {}}
                  onApprove={(id) => {
                    void (async () => {
                      const res = await approve(id)
                      if (res.ok === false) setError(res.message)
                      else setSuccess('Reserva aprovada.')
                    })()
                  }}
                  onReject={(id) => {
                    void (async () => {
                      const res = await reject(id)
                      if (res.ok === false) setError(res.message)
                      else setSuccess('Reserva rejeitada.')
                    })()
                  }}
                />
              ))
            )}
          </div>
        </Card>
      ) : null}

      {tab === 'recursos' ? (
        <Card title="Controle de recursos">
          <AdminResourcesPanel />
        </Card>
      ) : null}

      {tab === 'usuarios' ? (
        <>
        <Card title="Usuários cadastrados">
          <AdminUsersPanel />
        </Card>
        <Card title="Cadastro manual de usuário">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome completo" value={uName} onValueChange={setUName} />
            <Input label="CPF" value={uCpf} onValueChange={setUCpf} mask={maskCPF} placeholder="000.000.000-00" />
            <Input label="E-mail" value={uEmail} onValueChange={setUEmail} type="email" />
            <Input label="Senha" value={uPassword} onValueChange={setUPassword} type="password" />
            <Input label="Telefone" value={uPhone} onValueChange={setUPhone} mask={maskPhone} />
            <Select
              label="Instituição"
              value={uInstitution}
              onChange={(e) => setUInstitution(e.target.value as Institution)}
              options={[
                { value: 'SESI', label: 'SESI' },
                { value: 'SENAI', label: 'SENAI' },
              ]}
            />
            <Select
              label="Tipo"
              value={uType}
              onChange={(e) => setUType(e.target.value as UserTypeLabel)}
              options={[
                { value: 'Aluno', label: 'Aluno' },
                { value: 'Colaborador', label: 'Colaborador' },
                { value: 'Terceiros', label: 'Terceiros' },
              ]}
            />
            {uType === 'Terceiros' ? (
              <>
                <Input label="Justificativa" value={uJustificativa} onValueChange={setUJustificativa} />
                <Input label="Vínculo" value={uVinculo} onValueChange={setUVinculo} />
              </>
            ) : null}

            <div className="md:col-span-2 flex justify-end">
              <Button
                onClick={() => {
                  setError(null)
                  setSuccess(null)
                  if (!required(uName)) return setError('Nome é obrigatório.')
                  if (!validateCPF(uCpf)) return setError('CPF inválido.')
                  if (!isValidEmail(uEmail)) return setError('E-mail inválido.')
                  if (uPassword.trim().length < 6) return setError('Senha deve ter ao menos 6 caracteres.')
                  if (uType === 'Terceiros' && (!required(uJustificativa) || !required(uVinculo)))
                    return setError('Justificativa e vínculo são obrigatórios para Terceiros.')

                  void (async () => {
                  const res = await registerUser({
                    name: uName,
                    cpf: uCpf,
                    email: uEmail,
                    phone: uPhone,
                    password: uPassword,
                    institution: uInstitution,
                    type: uType,
                    modality: 'OUTRO',
                    justificativa: uType === 'Terceiros' ? uJustificativa : undefined,
                    vinculo: uType === 'Terceiros' ? uVinculo : undefined,
                    active: true,
                  })
                  if (res.ok === false) {
                    setError(res.message)
                    return
                  }
                  setSuccess('Usuário externo cadastrado com sucesso.')
                  setUName('')
                  setUCpf('')
                  setUEmail('')
                  setUPassword('')
                  setUPhone('')
                  setUJustificativa('')
                  setUVinculo('')
                  })()
                }}
              >
                <FaPlus aria-hidden="true" /> Cadastrar usuário
              </Button>
            </div>
          </div>
        </Card>
        </>
      ) : null}

      <Modal
        open={editOpen}
        title="Editar reserva (Admin)"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                void (async () => {
                  if (!editing) return
                  setError(null)
                  setSuccess(null)
                  const result = await updateReservation(editing.id, {
                    resourceType: eType,
                    resourceLabel: eLabel,
                    date: eDate,
                    startTime: eStart,
                    durationHours: eDuration,
                    peopleCount: ePeople,
                    notes: eNotes,
                  })
                  if (result.ok === false) {
                    setError(result.message)
                    return
                  }
                  setEditOpen(false)
                  setSuccess('Reserva atualizada.')
                })()
              }}
            >
              <FaCheck aria-hidden="true" /> Salvar
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Tipo"
            value={eType}
            onChange={(e) => {
              const v = e.target.value as ReservationResourceType
              setEType(v)
              setELabel(v === 'sala' ? salas[0] ?? '' : computadores[0] ?? '')
              setEPeople(1)
            }}
            options={[
              { value: 'sala', label: 'Sala' },
              { value: 'computador', label: 'Computador' },
            ]}
          />
          <Select
            label="Recurso"
            value={eLabel}
            onChange={(e) => setELabel(e.target.value)}
            options={(eType === 'sala' ? salas : computadores).map((x) => ({ value: x, label: x }))}
          />
          <Input label="Data" type="date" value={eDate} onValueChange={setEDate} />
          <Select
            label="Horário"
            value={eStart}
            onChange={(e) => setEStart(e.target.value)}
            options={timeOptions.map((t) => ({ value: t, label: t }))}
          />
          <Input
            label="Duração (horas)"
            type="number"
            min={1}
            value={String(eDuration)}
            onValueChange={(v) => setEDuration(Math.max(1, Number(v || 1)))}
          />
          <Input
            label={`Qtd. pessoas (limite: ${eType === 'sala' ? 5 : 2})`}
            type="number"
            min={1}
            value={String(ePeople)}
            onValueChange={(v) =>
              setEPeople(Math.min(eType === 'sala' ? 5 : 2, Math.max(1, Number(v || 1))))
            }
          />
          <div className="md:col-span-2">
            <Input label="Observações (opcional)" value={eNotes} onValueChange={setENotes} />
          </div>
          <div className="md:col-span-2 text-xs text-slate-600">
            Observação: se a duração passar de 3h, a reserva volta para <strong>Pendente</strong> automaticamente.
          </div>
        </div>
      </Modal>

      <Modal
        open={cTermOpen}
        title="Termo de Responsabilidade (obrigatório)"
        onClose={() => setCTermOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCTermOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                void (async () => {
                  if (!session) return
                  setError(null)
                  setSuccess(null)
                  const result = await createReservation({
                    user: session.user,
                    resourceType: cType,
                    resourceLabel: cLabel,
                    date: cDate,
                    startTime: cStart,
                    durationHours: cDuration,
                    peopleCount: cPeople,
                    termAccepted: cTermAccepted,
                    recurringWeekly: cRecurring,
                  })
                  if (result.ok === false) {
                    setError(result.message)
                    return
                  }
                  setCTermOpen(false)
                  setSuccess('Reserva criada (vinculada ao usuário logado na API).')
                  setCUserName('')
                  setCDate('')
                  setCStart('08:00')
                  setCDuration(1)
                  setCPeople(1)
                  setCRecurring(false)
                })()
              }}
              disabled={!cTermAccepted}
            >
              <FaCheck aria-hidden="true" /> Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Ao criar a reserva, declaro ciência e aceite do termo de responsabilidade aplicável ao uso do espaço e dos
            equipamentos.
          </p>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              type="checkbox"
              checked={cTermAccepted}
              onChange={(e) => setCTermAccepted(e.target.checked)}
              className="h-4 w-4 accent-senai-blue"
            />
            <span className="font-semibold text-slate-900">Li e aceito</span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
