import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import { useAuth } from '../hooks/useAuth'
import type { Institution, UserTypeLabel } from '../types'
import { maskCPF } from '../utils/maskCPF'
import { maskPhone } from '../utils/maskPhone'
import type { FieldErrors } from '../utils/validateForms'
import { isValidEmail, required, validateCPF } from '../utils/validateForms'

export default function Cadastro() {
  const navigate = useNavigate()
  const { registerUser } = useAuth()
  const [globalError, setGlobalError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [institution, setInstitution] = useState<Institution>('SENAI')
  const [type, setType] = useState<UserTypeLabel>('Aluno')
  const [justificativa, setJustificativa] = useState('')
  const [vinculo, setVinculo] = useState('')
  const [observacoesExtras, setObservacoesExtras] = useState('')
  const [errors, setErrors] = useState<FieldErrors<string>>({})

  const isTerceiro = type === 'Terceiros'

  function validate() {
    const next: FieldErrors<string> = {}
    if (!required(name)) next.name = 'Nome completo é obrigatório.'
    if (!validateCPF(cpf)) next.cpf = 'CPF inválido.'
    if (!isValidEmail(email)) next.email = 'E-mail inválido.'
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Telefone inválido.'
    if (password.trim().length < 6) next.password = 'Senha deve ter ao menos 6 caracteres.'
    if (isTerceiro) {
      if (!required(justificativa)) next.justificativa = 'Justificativa é obrigatória para Terceiros.'
      if (!required(vinculo)) next.vinculo = 'Vínculo é obrigatório para Terceiros.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card title="Cadastro de usuário">
          <div className="space-y-5">
            {globalError ? <Alert variant="danger">{globalError}</Alert> : null}

            <Alert title="Perfil bibliotecária">
              Contas administrativas são criadas somente na Área Admin por uma bibliotecária logada.
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input label="Nome completo" value={name} onValueChange={setName} error={errors.name} />
              </div>
              <Input label="CPF" value={cpf} onValueChange={setCpf} mask={maskCPF} error={errors.cpf} />
              <Input
                label="Telefone"
                value={phone}
                onValueChange={setPhone}
                mask={maskPhone}
                placeholder="(11) 99999-9999"
                error={errors.phone}
              />
              <div className="md:col-span-2">
                <Input label="E-mail" type="email" value={email} onValueChange={setEmail} error={errors.email} />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Senha"
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  error={errors.password}
                />
              </div>
              <Select
                label="Instituição"
                value={institution}
                onChange={(e) => setInstitution(e.target.value as Institution)}
                options={[
                  { value: 'SESI', label: 'SESI' },
                  { value: 'SENAI', label: 'SENAI' },
                ]}
              />
              <Select
                label="Tipo"
                value={type}
                onChange={(e) => setType(e.target.value as UserTypeLabel)}
                options={[
                  { value: 'Aluno', label: 'Aluno' },
                  { value: 'Colaborador', label: 'Colaborador' },
                  { value: 'Terceiros', label: 'Terceiros' },
                ]}
              />

              {isTerceiro ? (
                <>
                  <div className="md:col-span-2">
                    <Alert title="Terceiros — modalidade OUTRO">
                      Para terceiros, a modalidade é definida automaticamente como <strong>OUTRO</strong>. Preencha os
                      campos abaixo.
                    </Alert>
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Justificativa"
                      value={justificativa}
                      onValueChange={setJustificativa}
                      error={errors.justificativa}
                    />
                  </div>
                  <Input label="Vínculo" value={vinculo} onValueChange={setVinculo} error={errors.vinculo} />
                  <div className="md:col-span-2">
                    <Input
                      label="Observações extras"
                      value={observacoesExtras}
                      onValueChange={setObservacoesExtras}
                      placeholder="Informações adicionais (opcional)"
                    />
                  </div>
                </>
              ) : null}

              <div className="md:col-span-2 flex justify-end">
                <Button
                  onClick={() => {
                    void (async () => {
                      setGlobalError(null)
                      if (!validate()) return
                      const result = await registerUser({
                        name,
                        cpf,
                        email,
                        phone,
                        password,
                        institution,
                        type,
                        modality: isTerceiro ? 'OUTRO' : '—',
                        justificativa: isTerceiro ? justificativa : undefined,
                        vinculo: isTerceiro ? vinculo : undefined,
                        observacoesExtras: isTerceiro ? observacoesExtras : undefined,
                        active: true,
                      })
                      if (result.ok === false) {
                        setGlobalError(result.message)
                        return
                      }
                      navigate('/dashboard', { replace: true })
                    })()
                  }}
                >
                  Criar cadastro
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
