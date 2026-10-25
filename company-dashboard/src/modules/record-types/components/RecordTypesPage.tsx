import { useEffect, useState } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { domainConfig } from '../../../shared/config/domain'
import {
  createRecordType,
  deleteRecordType,
  getRecordTypes,
  toggleRecordTypeStatus,
  updateRecordType,
} from '../api'
import type { CustomFieldDefinition, RecordStatusDefinition, RecordType } from '../types'

const defaultStatuses: RecordStatusDefinition[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed', terminal: true },
]

const emptyForm = {
  key: '',
  name: '',
  pluralName: '',
  description: '',
  statusesText: JSON.stringify(defaultStatuses, null, 2),
  fieldsText: '[]',
  assignmentEnabled: false,
  assignedStatus: 'assigned',
  availableStatus: 'active',
  isActive: true,
}

function parseJson<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T
  } catch {
    throw new Error(`${label} must contain valid JSON.`)
  }
}

export default function RecordTypesPage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<RecordType[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => setItems(await getRecordTypes())

  useEffect(() => {
    const init = async () => {
      try { await load() } catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to load record types.') }) }
    }
    void init()
  }, [setNotice])

  const reset = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const statuses = parseJson<RecordStatusDefinition[]>(form.statusesText, 'Statuses')
      const fields = parseJson<CustomFieldDefinition[]>(form.fieldsText, 'Custom fields')
      const payload = {
        key: form.key,
        name: form.name,
        pluralName: form.pluralName || undefined,
        description: form.description || undefined,
        statuses,
        fields,
        assignment: {
          enabled: form.assignmentEnabled,
          assignedStatus: form.assignedStatus,
          availableStatus: form.availableStatus,
        },
        isActive: form.isActive,
      }
      if (editingId) await updateRecordType(editingId, payload)
      else await createRecordType(payload)
      reset()
      await load()
      setNotice({ type: 'success', message: `${domainConfig.typeSingular} saved.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Failed to save ${domainConfig.typeSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item: RecordType) => {
    setEditingId(item._id)
    setForm({
      key: item.key,
      name: item.name,
      pluralName: item.pluralName ?? '',
      description: item.description ?? '',
      statusesText: JSON.stringify(item.statuses, null, 2),
      fieldsText: JSON.stringify(item.fields, null, 2),
      assignmentEnabled: item.assignment?.enabled ?? false,
      assignedStatus: item.assignment?.assignedStatus ?? 'assigned',
      availableStatus: item.assignment?.availableStatus ?? 'active',
      isActive: item.isActive,
    })
  }

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${domainConfig.typeSingular.toLowerCase()}?`)) return
    setSubmitting(true)
    try {
      await deleteRecordType(id)
      await load()
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to delete record type.') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight">{domainConfig.typePlural}</h2>
        <p className="mt-1 text-sm text-slate-500">Define domain-specific statuses and custom fields without changing backend code.</p>
        {canManage ? (
          <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="Key, e.g. support-case" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            <input value={form.pluralName} onChange={(e) => setForm({ ...form, pluralName: e.target.value })} placeholder="Plural name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            <label className="md:col-span-2"><span className="mb-1 block text-sm font-medium">Statuses JSON</span><textarea value={form.statusesText} onChange={(e) => setForm({ ...form, statusesText: e.target.value })} rows={5} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs" /></label>
            <label className="md:col-span-2"><span className="mb-1 block text-sm font-medium">Custom fields JSON</span><textarea value={form.fieldsText} onChange={(e) => setForm({ ...form, fieldsText: e.target.value })} rows={5} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs" placeholder='[{"key":"priority","label":"Priority","type":"select","options":["low","high"]}]' /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.assignmentEnabled} onChange={(e) => setForm({ ...form, assignmentEnabled: e.target.checked })} /> Enable assignments</label>
            <div className="flex gap-2"><input value={form.assignedStatus} onChange={(e) => setForm({ ...form, assignedStatus: e.target.value })} placeholder="Assigned status" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.availableStatus} onChange={(e) => setForm({ ...form, availableStatus: e.target.value })} placeholder="Available status" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></div>
            <div className="flex gap-3 md:col-span-2"><button type="button" onClick={() => void submit()} disabled={submitting} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{editingId ? 'Update' : 'Add'} {domainConfig.typeSingular.toLowerCase()}</button>{editingId ? <button type="button" onClick={reset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">Reset</button> : null}</div>
          </div>
        ) : null}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Key</th><th className="px-4 py-3">Statuses</th><th className="px-4 py-3">Fields</th><th className="px-4 py-3">Status</th>{canManage ? <th className="px-4 py-3">Actions</th> : null}</tr></thead><tbody className="divide-y divide-slate-100">{items.length === 0 ? <tr><td colSpan={canManage ? 6 : 5} className="px-4 py-8"><EmptyState title={`No ${domainConfig.typePlural.toLowerCase()} yet`} message="Create a record type to start using the generic workspace." /></td></tr> : items.map((item) => <tr key={item._id}><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3 text-slate-600">{item.key}</td><td className="px-4 py-3 text-slate-600">{item.statuses.length}</td><td className="px-4 py-3 text-slate-600">{item.fields.length}</td><td className="px-4 py-3 text-slate-600">{item.isActive ? 'Active' : 'Inactive'}</td>{canManage ? <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => startEdit(item)} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700">Edit</button><button type="button" onClick={() => void toggleRecordTypeStatus(item._id, !item.isActive).then(load)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">Toggle</button><button type="button" onClick={() => void remove(item._id)} disabled={submitting} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">Delete</button></div></td> : null}</tr>)}</tbody></table>
        </div>
      </section>
    </PageShell>
  )
}
