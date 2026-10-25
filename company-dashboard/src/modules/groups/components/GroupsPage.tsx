import { useEffect, useState } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { domainConfig } from '../../../shared/config/domain'
import { createGroup, deleteGroup, getGroups, toggleGroupStatus, updateGroup } from '../api'
import type { Group } from '../types'

const emptyForm = { name: '', key: '', description: '' }

export default function GroupsPage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<Group[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => setItems(await getGroups())
  useEffect(() => {
    const init = async () => {
      try { await load() } catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to load groups.') }) }
    }
    void init()
  }, [setNotice])

  const reset = () => { setEditingId(null); setForm(emptyForm) }
  const submit = async () => {
    if (!form.name.trim()) return
    setSubmitting(true)
    try { if (editingId) await updateGroup(editingId, form); else await createGroup(form); reset(); await load() }
    catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to save group.') }) }
    finally { setSubmitting(false) }
  }
  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${domainConfig.groupSingular.toLowerCase()}?`)) return
    setSubmitting(true)
    try { await deleteGroup(id); await load() } catch (error) { setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to delete group.') }) } finally { setSubmitting(false) }
  }

  return <PageShell><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-semibold">{domainConfig.groupPlural}</h2><p className="mt-1 text-sm text-slate-500">Manage reusable organizational and logical groups.</p>{canManage ? <div className="mt-5 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="min-w-[200px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="Key (optional)" className="min-w-[200px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-w-[200px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /><button type="button" onClick={() => void submit()} disabled={submitting} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{editingId ? 'Update' : 'Add'}</button>{editingId ? <button type="button" onClick={reset} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">Reset</button> : null}</div> : null}<div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-[640px] w-full text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Key</th><th className="px-4 py-3">Status</th>{canManage ? <th className="px-4 py-3">Actions</th> : null}</tr></thead><tbody className="divide-y divide-slate-100">{items.length === 0 ? <tr><td colSpan={canManage ? 4 : 3} className="px-4 py-8"><EmptyState title={`No ${domainConfig.groupPlural.toLowerCase()} yet`} message="Create a group to connect records and people." /></td></tr> : items.map((item) => <tr key={item._id}><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3 text-slate-600">{item.key}</td><td className="px-4 py-3 text-slate-600">{item.isActive ? 'Active' : 'Inactive'}</td>{canManage ? <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingId(item._id); setForm({ name: item.name, key: item.key, description: item.description ?? '' }) }} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-700">Edit</button><button type="button" onClick={() => void toggleGroupStatus(item._id, !item.isActive).then(load)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">Toggle</button><button type="button" onClick={() => void remove(item._id)} disabled={submitting} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">Delete</button></div></td> : null}</tr>)}</tbody></table></div></section></PageShell>
}
