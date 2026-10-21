import { useEffect, useState } from 'react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, toggleDepartmentStatus } from '../../../lib/api'
import type { Department, DepartmentForm } from '../types'

export function DepartmentsPage({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<Department[]>([])
  const [form, setForm] = useState<DepartmentForm>({ name: '', code: '', description: '', isActive: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    const data = await getDepartments()
    setItems(Array.isArray(data) ? data : (data as any).items ?? [])
  }
  useEffect(() => { void load() }, [])

  const submit = async () => {
    if (editingId) await updateDepartment(editingId, form)
    else await createDepartment(form)
    setForm({ name: '', code: '', description: '', isActive: true })
    setEditingId(null)
    await load()
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Departments</h2>
      {canManage && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border px-4 py-2" />
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="rounded-2xl border px-4 py-2" />
          <button onClick={() => void submit()} className="rounded-2xl bg-slate-900 px-4 py-2 text-white">Save</button>
        </div>
      )}
      <table className="mt-6 w-full text-sm">
        <thead><tr><th>Name</th><th>Code</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
        <tbody>
          {items.map((d) => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td>{d.code}</td>
              <td>{d.isActive ? 'Active' : 'Inactive'}</td>
              {canManage && (
                <td className="flex gap-2">
                  <button onClick={() => { setEditingId(d._id); setForm({ name: d.name, code: d.code, description: d.description || '', isActive: d.isActive }) }}>Edit</button>
                  <button onClick={() => void toggleDepartmentStatus(d._id, !d.isActive).then(load)}>Toggle</button>
                  <button onClick={() => void deleteDepartment(d._id).then(load)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
