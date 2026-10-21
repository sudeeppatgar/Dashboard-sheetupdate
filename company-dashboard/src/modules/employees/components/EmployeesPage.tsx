import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus, getDepartments } from '../../../lib/api'
import type { Employee } from '../types'
import type { Department } from '../../departments/types'
import EmptyState from '../../../shared/components/EmptyState'

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
  const [submitting, setSubmitting] = useState(false)

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
    setSubmitting(true)
    try {
      if (editingId) await updateEmployee(editingId, form)
      else await createEmployee(form)
      setForm({ employeeNumber: '', name: '', email: '', departmentId: '', jobTitle: '', isActive: true })
      setEditingId(null)
      await load()
    } finally {
      setSubmitting(false)
    }
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this employee?')) return
    setSubmitting(true)
    try {
      await deleteEmployee(id)
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Employees</h2>
          <p className="mt-1 text-sm text-slate-500">Manage company employees.</p>
        </div>
      </div>

      {canManage ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} placeholder="Number" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400" />
            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400">
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Job title" className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400" />
            <button onClick={() => void submit()} disabled={submitting} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId ? (
              <button onClick={() => { setEditingId(null); setForm({ employeeNumber: '', name: '', email: '', departmentId: '', jobTitle: '', isActive: true }) }} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Reset
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access to employees.
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={canManage ? 6 : 5}>
                  <EmptyState title="No employees yet" message={canManage ? 'Add an employee to get started.' : 'No employees available.'} />
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr key={e._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{e.employeeNumber}</td>
                  <td className="px-4 py-3 text-slate-900">{e.name}</td>
                  <td className="px-4 py-3 text-slate-600">{e.email}</td>
                  <td className="px-4 py-3 text-slate-600">{typeof e.departmentId === 'string' ? e.departmentId : (e.departmentId as { name?: string })?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.isActive ? 'Active' : 'Inactive'}</td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => startEdit(e)} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100">Edit</button>
                        <button onClick={() => void toggleEmployeeStatus(e._id, !e.isActive).then(load)} disabled={submitting} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">Toggle</button>
                        <button onClick={() => void handleDelete(e._id)} disabled={submitting} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
