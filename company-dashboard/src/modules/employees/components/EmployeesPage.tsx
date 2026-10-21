import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus } from '../../../lib/api'
import type { Employee } from '../types'

export function EmployeesPage({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<Employee[]>([])
  const [form, setForm] = useState<any>({ employeeNumber: '', name: '', email: '', departmentId: '', jobTitle: '', isActive: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => { const data = await getEmployees(); setItems(Array.isArray(data) ? data : []) }
  useEffect(() => { void load() }, [])

  const submit = async () => {
    if (editingId) await updateEmployee(editingId, form)
    else await createEmployee(form)
    setForm({ employeeNumber: '', name: '', email: '', departmentId: '', jobTitle: '', isActive: true })
    setEditingId(null)
    await load()
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Employees</h2>
      {canManage && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} placeholder="Number" className="rounded-2xl border px-4 py-2" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border px-4 py-2" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border px-4 py-2" />
          <button onClick={() => void submit()} className="rounded-2xl bg-slate-900 px-4 py-2 text-white">Save</button>
        </div>
      )}
      <table className="mt-6 w-full text-sm">
        <thead><tr><th>Number</th><th>Name</th><th>Email</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
        <tbody>
          {items.map((e) => (
            <tr key={e._id}>
              <td>{e.employeeNumber}</td>
              <td>{e.name}</td>
              <td>{e.email}</td>
              <td>{e.isActive ? 'Active' : 'Inactive'}</td>
              {canManage && (
                <td className="flex gap-2">
                  <button onClick={() => { setEditingId(e._id); setForm(e) }}>Edit</button>
                  <button onClick={() => void toggleEmployeeStatus(e._id, !e.isActive).then(load)}>Toggle</button>
                  <button onClick={() => void deleteEmployee(e._id).then(load)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
