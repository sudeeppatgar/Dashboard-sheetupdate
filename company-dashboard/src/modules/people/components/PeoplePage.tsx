import { useEffect, useState } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { domainConfig } from '../../../shared/config/domain'
import { getGroups } from '../../groups/api'
import type { Group } from '../../groups/types'
import { createPerson, deletePerson, getPeople, togglePersonStatus, updatePerson } from '../api'
import type { Person } from '../types'

const emptyForm = { name: '', reference: '', email: '', groupId: '', title: '', phone: '', location: '' }

export default function PeoplePage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<Person[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const load = async () => setItems(await getPeople())
  useEffect(() => {
    const init = async () => {
      try { const [, groupList] = await Promise.all([load(), getGroups()]); setGroups(groupList) }
      catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to load people.') }) }
    }
    void init()
  }, [setNotice])
  const reset = () => { setEditingId(null); setForm(emptyForm) }
  const submit = async () => {
    if (!form.name.trim()) return
    setSubmitting(true)
    try { if (editingId) await updatePerson(editingId, form); else await createPerson(form); reset(); await load() } catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to save person.') }) } finally { setSubmitting(false) }
  }
  const remove = async (id: string) => { if (!window.confirm(`Delete this ${domainConfig.personSingular.toLowerCase()}?`)) return; setSubmitting(true); try { await deletePerson(id); await load() } catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to delete person.') }) } finally { setSubmitting(false) } }
  const groupName = (groupId?: Group | string) => typeof groupId === 'string' ? groups.find((group) => group._id === groupId)?.name ?? '—' : groupId?.name ?? '—'

  return <PageShell><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">{domainConfig.personPlural}</h2><p className="mt-1 text-sm text-slate-500">Manage people who can own or be associated with records.</p>{canManage ? <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Reference" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="">Select {domainConfig.groupSingular.toLowerCase()}</option>{groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}</select><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><div className="flex gap-3 md:col-span-2"><button type="button" onClick={() => void submit()} disabled={submitting} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{editingId ? 'Update' : 'Add'}</button>{editingId ? <button type="button" onClick={reset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">Reset</button> : null}</div></div> : null}<div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">{domainConfig.groupSingular}</th><th className="px-4 py-3">Status</th>{canManage ? <th className="px-4 py-3">Actions</th> : null}</tr></thead><tbody className="divide-y divide-slate-100">{items.length === 0 ? <tr><td colSpan={canManage ? 6 : 5} className="px-4 py-8"><EmptyState title={`No ${domainConfig.personPlural.toLowerCase()} yet`} message="Create a person to make records assignable." /></td></tr> : items.map((item) => <tr key={item._id}><td className="px-4 py-3 font-medium">{item.reference || '—'}</td><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3 text-slate-600">{item.email || '—'}</td><td className="px-4 py-3 text-slate-600">{groupName(item.groupId)}</td><td className="px-4 py-3 text-slate-600">{item.isActive ? 'Active' : 'Inactive'}</td>{canManage ? <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingId(item._id); setForm({ name: item.name, reference: item.reference ?? '', email: item.email ?? '', groupId: typeof item.groupId === 'string' ? item.groupId : item.groupId?._id ?? '', title: item.title ?? '', phone: item.phone ?? '', location: item.location ?? '' }) }} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700">Edit</button><button type="button" onClick={() => void togglePersonStatus(item._id, !item.isActive).then(load)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">Toggle</button><button type="button" onClick={() => void remove(item._id)} disabled={submitting} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">Delete</button></div></td> : null}</tr>)}</tbody></table></div></section></PageShell>
}
