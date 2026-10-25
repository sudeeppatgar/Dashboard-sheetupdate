import { useEffect, useState } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { domainConfig } from '../../../shared/config/domain'
import { createGroup, deleteGroup, getGroups, toggleGroupStatus, updateGroup } from '../api'
import type { Group } from '../types'

type GroupForm = {
  name: string
  key: string
  description: string
}

const createEmptyForm = (): GroupForm => ({ name: '', key: '', description: '' })
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100'
const secondaryButtonClass = 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonClass = 'rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'

export default function GroupsPage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<Group[]>([])
  const [form, setForm] = useState<GroupForm>(createEmptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => setItems(await getGroups())

  useEffect(() => {
    const init = async () => {
      try {
        await load()
      } catch (error) {
        setNotice({ type: 'error', message: getErrorMessage(error, `Unable to load ${domainConfig.groupPlural.toLowerCase()}.`) })
      }
    }
    void init()
  }, [setNotice])

  const reset = () => {
    setEditingId(null)
    setForm(createEmptyForm())
  }

  const submit = async () => {
    if (!form.name.trim()) {
      setNotice({ type: 'error', message: `Give this ${domainConfig.groupSingular.toLowerCase()} a name.` })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        key: form.key.trim() || undefined,
        description: form.description.trim() || undefined,
      }
      if (editingId) await updateGroup(editingId, payload)
      else await createGroup(payload)
      reset()
      await load()
      setNotice({ type: 'success', message: `${domainConfig.groupSingular} saved.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to save ${domainConfig.groupSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item: Group) => {
    setEditingId(item._id)
    setForm({ name: item.name, key: item.key ?? '', description: item.description ?? '' })
    window.requestAnimationFrame(() => document.getElementById('group-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${domainConfig.groupSingular.toLowerCase()}?`)) return
    setSubmitting(true)
    try {
      await deleteGroup(id)
      await load()
      setNotice({ type: 'success', message: `${domainConfig.groupSingular} deleted.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to delete ${domainConfig.groupSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-5 py-7 text-white sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Workspace setup</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Organize your {domainConfig.groupPlural.toLowerCase()}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Groups help you connect related records and people. Use a group for a team, location, department, project, or any other useful collection.</p>
        </div>

        {canManage ? (
          <form id="group-form" onSubmit={(event) => { event.preventDefault(); void submit() }} className="space-y-6 border-b border-slate-200 p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{editingId ? 'Edit group' : 'Create a group'}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{editingId ? `Update this ${domainConfig.groupSingular.toLowerCase()}` : `Add a new ${domainConfig.groupSingular.toLowerCase()}`}</h3>
                <p className="mt-1 text-sm text-slate-500">Give it a clear name so people know what belongs in it.</p>
              </div>
              {editingId ? <button type="button" onClick={reset} className={secondaryButtonClass}>Cancel editing</button> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Name <span className="text-rose-500">*</span></span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="For example, Customer Success" className={inputClass} />
                <span className="mt-1.5 block text-xs text-slate-500">The name people will see when selecting a group.</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Internal key</span>
                <input value={form.key} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))} placeholder="customer-success" className={inputClass} />
                <span className="mt-1.5 block text-xs text-slate-500">Optional stable identifier for integrations.</span>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Description</span>
                <textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Explain what this group is used for" className={inputClass} />
              </label>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {editingId ? <button type="button" onClick={reset} className={secondaryButtonClass}>Cancel</button> : null}
              <button type="submit" disabled={submitting} className={primaryButtonClass}>{submitting ? 'Saving…' : editingId ? `Save ${domainConfig.groupSingular.toLowerCase()}` : `Create ${domainConfig.groupSingular.toLowerCase()}`}</button>
            </div>
          </form>
        ) : (
          <div className="m-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900 sm:m-8">
            <p className="font-semibold">These groups are managed by administrators.</p>
            <p className="mt-1">You can still use the available groups when creating records.</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Saved groups</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Available {domainConfig.groupPlural.toLowerCase()}</h3>
          </div>
          <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? 'group' : 'groups'}</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {items.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState title={`No ${domainConfig.groupPlural.toLowerCase()} yet`} message={`Create a ${domainConfig.groupSingular.toLowerCase()} above to connect records and people.`} />
            </div>
          ) : items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-200 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-950">{item.name}</h4>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{item.key || 'No internal key'}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.isActive ? 'Available' : 'Hidden'}</span>
              </div>
              <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{item.description || 'No description added yet.'}</p>
              {canManage ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => startEdit(item)} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 hover:bg-cyan-100">Edit group</button>
                  <button type="button" onClick={() => void toggleGroupStatus(item._id, !item.isActive).then(load)} className={secondaryButtonClass}>{item.isActive ? 'Hide' : 'Make available'}</button>
                  <button type="button" onClick={() => void remove(item._id)} disabled={submitting} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50">Delete</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
