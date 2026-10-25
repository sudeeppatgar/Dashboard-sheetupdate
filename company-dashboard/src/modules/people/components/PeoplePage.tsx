import { useEffect, useState } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import Button from '../../../shared/components/Button'
import PageHero from '../../../shared/components/PageHero'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { domainConfig } from '../../../shared/config/domain'
import { getGroups } from '../../groups/api'
import type { Group } from '../../groups/types'
import { createPerson, deletePerson, getPeople, togglePersonStatus, updatePerson } from '../api'
import type { Person } from '../types'

type PersonForm = {
  name: string
  reference: string
  email: string
  groupId: string
  title: string
  phone: string
  location: string
}

const createEmptyForm = (): PersonForm => ({ name: '', reference: '', email: '', groupId: '', title: '', phone: '', location: '' })
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100'

const getGroupName = (groupId: Person['groupId'], groups: Group[]) => {
  if (!groupId) return 'No group'
  if (typeof groupId !== 'string') return groupId.name
  return groups.find((group) => group._id === groupId)?.name ?? 'No group'
}

const getInitials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?'

export default function PeoplePage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<Person[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [form, setForm] = useState<PersonForm>(createEmptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => setItems(await getPeople())

  useEffect(() => {
    const init = async () => {
      try {
        const [, groupList] = await Promise.all([load(), getGroups()])
        setGroups(groupList)
      } catch (error) {
        setNotice({ type: 'error', message: getErrorMessage(error, `Unable to load ${domainConfig.personPlural.toLowerCase()}.`) })
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
      setNotice({ type: 'error', message: `Give this ${domainConfig.personSingular.toLowerCase()} a name.` })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        reference: form.reference.trim() || undefined,
        email: form.email.trim() || undefined,
        groupId: form.groupId || undefined,
        title: form.title.trim() || undefined,
        phone: form.phone.trim() || undefined,
        location: form.location.trim() || undefined,
      }
      if (editingId) await updatePerson(editingId, payload)
      else await createPerson(payload)
      reset()
      await load()
      setNotice({ type: 'success', message: `${domainConfig.personSingular} saved.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to save ${domainConfig.personSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item: Person) => {
    setEditingId(item._id)
    setForm({
      name: item.name,
      reference: item.reference ?? '',
      email: item.email ?? '',
      groupId: typeof item.groupId === 'string' ? item.groupId : item.groupId?._id ?? '',
      title: item.title ?? '',
      phone: item.phone ?? '',
      location: item.location ?? '',
    })
    window.requestAnimationFrame(() => document.getElementById('person-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${domainConfig.personSingular.toLowerCase()}?`)) return
    setSubmitting(true)
    try {
      await deletePerson(id)
      await load()
      setNotice({ type: 'success', message: `${domainConfig.personSingular} deleted.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to delete ${domainConfig.personSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <PageHero eyebrow="Workspace setup" title={`Manage your ${domainConfig.personPlural.toLowerCase()}`} description="Add the people who can be connected to records or receive assignments. Add only the contact details your team needs." />

        {canManage ? (
          <form id="person-form" onSubmit={(event) => { event.preventDefault(); void submit() }} className="space-y-6 border-b border-slate-200 p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{editingId ? 'Edit person' : 'Add a person'}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{editingId ? `Update this ${domainConfig.personSingular.toLowerCase()}` : `Add a new ${domainConfig.personSingular.toLowerCase()}`}</h3>
                <p className="mt-1 text-sm text-slate-500">The name is required. Everything else can be added later.</p>
              </div>
              {editingId ? <Button type="button" onClick={reset}>Cancel editing</Button> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Full name <span className="text-rose-500">*</span></span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="For example, Alex Morgan" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Reference</span>
                <input value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} placeholder="Employee ID or reference" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Email</span>
                <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="alex@example.com" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Group</span>
                <select value={form.groupId} onChange={(event) => setForm((current) => ({ ...current, groupId: event.target.value }))} className={inputClass}>
                  <option value="">No group</option>
                  {groups.filter((group) => group.isActive).map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}
                </select>
                <span className="mt-1.5 block text-xs text-slate-500">Optional. Groups help you organize people.</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Job title</span>
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Operations manager" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Phone</span>
                <input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="(555) 123-4567" className={inputClass} />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Location</span>
                <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="New York office" className={inputClass} />
              </label>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {editingId ? <Button type="button" onClick={reset}>Cancel</Button> : null}
              <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Saving…' : editingId ? `Save ${domainConfig.personSingular.toLowerCase()}` : `Add ${domainConfig.personSingular.toLowerCase()}`}</Button>
            </div>
          </form>
        ) : (
          <div className="m-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900 sm:m-8">
            <p className="font-semibold">These people are managed by administrators.</p>
            <p className="mt-1">You can still assign records to active people.</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Directory</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Your {domainConfig.personPlural.toLowerCase()}</h3>
          </div>
          <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? 'person' : 'people'}</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {items.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState title={`No ${domainConfig.personPlural.toLowerCase()} yet`} message={`Add a ${domainConfig.personSingular.toLowerCase()} above so records can be assigned to them.`} />
            </div>
          ) : items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-200 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-sm font-bold text-cyan-800">{getInitials(item.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-950">{item.name}</h4>
                      <p className="mt-1 text-sm text-slate-500">{item.title || 'No job title added'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Group</dt><dd className="mt-0.5 text-slate-700">{getGroupName(item.groupId, groups)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Reference</dt><dd className="mt-0.5 text-slate-700">{item.reference || '—'}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Email</dt><dd className="mt-0.5 truncate text-slate-700">{item.email || '—'}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt><dd className="mt-0.5 text-slate-700">{item.location || '—'}</dd></div>
              </dl>
              {canManage ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="accent" size="sm" onClick={() => startEdit(item)}>Edit person</Button>
                  <Button type="button" size="sm" onClick={() => void togglePersonStatus(item._id, !item.isActive).then(load)}>{item.isActive ? 'Deactivate' : 'Activate'}</Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => void remove(item._id)} disabled={submitting}>Delete</Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
