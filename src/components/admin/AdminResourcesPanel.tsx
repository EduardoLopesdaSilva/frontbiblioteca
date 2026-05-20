import { useEffect, useState } from 'react'
import Alert from '../Alert'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import { apiCreateResource, apiListResourcesAdmin, apiSetResourceActive } from '../../services/resourceApi'
import { mapApiResource } from '../../utils/apiMappers'
import type { ResourceItem } from '../../types'

export default function AdminResourcesPanel() {
  const [items, setItems] = useState<ResourceItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<'SALA_ESTUDO' | 'COMPUTADOR'>('SALA_ESTUDO')
  const [cap, setCap] = useState('5')

  async function load() {
    try {
      const list = await apiListResourcesAdmin()
      setItems(list.map(mapApiResource))
    } catch {
      setError('Falha ao carregar recursos.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
        <Input label="Nome" value={name} onValueChange={setName} />
        <Select
          label="Tipo"
          value={type}
          onChange={(e) => {
            const v = e.target.value as 'SALA_ESTUDO' | 'COMPUTADOR'
            setType(v)
            setCap(v === 'SALA_ESTUDO' ? '5' : '2')
          }}
          options={[
            { value: 'SALA_ESTUDO', label: 'Sala' },
            { value: 'COMPUTADOR', label: 'Computador' },
          ]}
        />
        <Input label="Capacidade" type="number" value={cap} onValueChange={setCap} />
        <div className="flex items-end">
          <Button
            onClick={() => {
              void (async () => {
                setError(null)
                await apiCreateResource({ name, resourceType: type, maxCapacity: Number(cap) })
                setName('')
                await load()
              })()
            }}
          >
            Criar recurso
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-senai-gray text-left text-xs font-bold uppercase text-slate-600">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Cap.</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="p-3 font-semibold">{r.name}</td>
                <td className="p-3">{r.resourceType === 'sala' ? 'Sala' : 'Computador'}</td>
                <td className="p-3">{r.maxCapacity}</td>
                <td className="p-3">
                  <span
                    className={
                      r.active
                        ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800'
                        : 'rounded-full bg-senai-red/10 px-2 py-0.5 text-xs font-semibold text-senai-red'
                    }
                  >
                    {r.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3">
                  <Button
                    variant="secondary"
                    className="px-2 py-1 text-xs"
                    onClick={() => {
                      void (async () => {
                        await apiSetResourceActive(r.id, !r.active)
                        await load()
                      })()
                    }}
                  >
                    {r.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
