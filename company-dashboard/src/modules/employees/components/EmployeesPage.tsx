import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus, getDepartments } from '../../../lib/api'
import type { Employee } from '../types'
import type { Department } from '../../departments/types'

type EmployeeForm = {
  employeeNumber: string
  name: string
  email: string
  departmentId: string
  jobTitle: string
  isActive: boolean
}

export function EmployeesPage({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [form, setForm] = useState<EmployeeForm>({ employeeNumber: '', name: '', email: '', departmentId: '', jobTitle: '', isActive: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    const data = await getEmployees()
    setItems(Array.isArray(data) ? data : [])
  }

  const loadDepartments = async () => {
    const data = await getDepartments()
    setDepartments(Array.isArray(data) ? data : [])
  }

  useEffect(() => { void load(); void loadDepartments() }, [])

  const submit = async () => {
    if (!form.departmentId) return
    if (editingId) await updateEmployee(editingId, form)
    else await createEmployee(form)
    setForm({ employeeNumber: '', name: '', email: '', departmentId: '', jobTitle: '', isActive: true })
    setEditingId(null)
    await load()
  }

  const startEdit = (e: Employee) => {
    setEditingId(e._id)
    setForm({
      employeeNumber: e.employeeNumber,
      name: e.name,
      email: e.email,
      departmentId: typeof e.departmentId === 'string' ? e.departmentId : (e.departmentId as { _id?: string })?._id ?? '',
      jobTitle: e.jobTitle ?? '',
      isActive: e.isActive,
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Employees</h2>
      {canManage && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} placeholder="Number" className="rounded-2xl border px-4 py-2" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border px-4 py-2" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border px-4 py-2" />
          <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="rounded-2xl border px-4 py-2">
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Job title" className="rounded-2xl border px-4 py-2" />
          <button onClick={() => void submit()} className="rounded-2xl bg-slate-900 px-4 py-2 text-white">Save</button>
        </div>
      )}
      <table className="mt-6 w-full text-sm">
        <thead><tr><th>Number</th><th>Name</th><th>Email</th><th>Department</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
        <tbody>
          {items.map((e) => (
            <tr key={e._id}>
              <td>{e.employeeNumber}</td>
              <td>{e.name}</td>
              <td>{e.email}</td>
              <td>{typeof e.departmentId === 'string' ? e.departmentId : (e.departmentId as { name?: string })?.name ?? '—'}</td>
              <td>{e.isActive ? 'Active' : 'Inactive'}</td>
              {canManage && (
                <td className="flex gap-2">
                  <button onClick={() => startEdit(e)}>Edit</button>
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
