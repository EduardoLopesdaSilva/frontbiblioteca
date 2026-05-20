import { useEffect, useMemo, useState } from 'react'
import { apiListUsers, type ApiUserAdmin } from '../../services/userApi'
import Input from '../Input'

const typeLabel: Record<string, string> = {
  ALUNO: 'Aluno',
  COLABORADOR: 'Colaborador',
  TERCEIRO: 'Terceiros',
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<ApiUserAdmin[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'name' | 'reservations'>('name')

  useEffect(() => {
    void (async () => {
      const list = await apiListUsers(search)
      setUsers(list)
    })()
  }, [search])

  const sorted = useMemo(() => {
    const copy = [...users]
    if (sort === 'reservations') copy.sort((a, b) => b.reservationCount - a.reservationCount)
    else copy.sort((a, b) => a.name.localeCompare(b.name))
    return copy
  }, [users, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input label="Pesquisar" value={search} onValueChange={setSearch} placeholder="Nome ou e-mail" />
        <label className="text-sm text-slate-700">
          Ordenar:{' '}
          <select
            className="ml-1 rounded border border-slate-200 px-2 py-1"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'name' | 'reservations')}
          >
            <option value="name">Nome</option>
            <option value="reservations">Reservas</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
        <table className="min-w-full text-sm">
          <thead className="bg-senai-gray text-left text-xs font-bold uppercase text-slate-600">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Instituição</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reservas</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3 font-semibold">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3">{typeLabel[u.userType] ?? u.userType}</td>
                <td className="p-3">{u.institution}</td>
                <td className="p-3">{u.active ? 'Ativo' : 'Inativo'}</td>
                <td className="p-3">{u.reservationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
