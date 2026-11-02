import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import Button from '../../../shared/components/Button'
import PageHero from '../../../shared/components/PageHero'
import { useApp } from '../../../shared/context/useApp'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { formatDate, formatTimestamp } from '../../../shared/utils/formatDate'
import { domainConfig } from '../../../shared/config/domain'
import { getCategories } from '../../catalog/api'
import type { Category } from '../../catalog/types'
import { getGroups } from '../../groups/api'
import type { Group } from '../../groups/types'
import { getPeople } from '../../people/api'
import type { Person } from '../../people/types'
import { getRecordTypes } from '../../record-types/api'
import type { CustomFieldDefinition, RecordType } from '../../record-types/types'
import {
  assignRecord,
  createRecord,
  deleteRecord,
  downloadRecordsCsv,
  getRecordHistory,
  getRecords,
  returnRecord,
  updateRecord,
} from '../api'
import { dateInputValue, emptyRecordFilters, emptyRecordForm } from '../constants'
import type { RecordAssignmentHistory, RecordFilters, RecordFormValue, WorkspaceRecord } from '../types'

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100'

const getId = (value?: { _id?: string } | string) => typeof value === 'string' ? value : value?._id ?? ''
const getName = (value?: { name?: string } | string) => typeof value === 'string' ? value : value?.name ?? '—'

function Field({ definition, value, onChange }: { definition: CustomFieldDefinition; value: unknown; onChange: (value: unknown) => void }) {
  if (definition.type === 'boolean') {
    return (
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
        <span>
          <span className="block font-medium text-slate-800">{definition.label}{definition.required ? <span className="ml-1 text-rose-500">*</span> : null}</span>
          <span className="mt-1 block text-xs text-slate-500">Yes or no</span>
        </span>
      </label>
    )
  }

  const commonProps = {
    value: String(value ?? ''),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(definition.type === 'number' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value),
    className: inputClass,
    required: definition.required,
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800">{definition.label}{definition.required ? <span className="ml-1 text-rose-500">*</span> : null}</span>
      {definition.type === 'multiline' ? <textarea {...commonProps} rows={3} /> : definition.type === 'select' ? (
        <select {...commonProps}>
          <option value="">Select {definition.label.toLowerCase()}</option>
          {(definition.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : <input {...commonProps} type={definition.type === 'date' ? 'date' : definition.type === 'number' ? 'number' : 'text'} />}
    </label>
  )
}

function AssignmentDialog({ record, people, mode, submitting, onClose, onSubmit }: { record: WorkspaceRecord; people: Person[]; mode: 'assign' | 'return'; submitting: boolean; onClose: () => void; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [personId, setPersonId] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const recordGroupId = getId(record.groupId)
  const eligiblePeople = people.filter((person) => person.isActive && (!recordGroupId || getId(person.groupId) === recordGroupId))
  const recordGroupName = getName(record.groupId)

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'assign' && !personId) return
    await onSubmit(mode === 'assign'
      ? { personId, assignedAt: date || undefined, notes: notes.trim() || undefined }
      : { returnedAt: date || undefined, returnNotes: notes.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="assignment-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">{mode === 'assign' ? 'Assign record' : 'Return record'}</p>
            <h2 id="assignment-title" className="mt-1 text-2xl font-semibold text-slate-950">{record.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{mode === 'assign' ? 'Choose who will own this record.' : 'Close the current assignment and add an optional note.'}</p>
          </div>
          <Button type="button" onClick={onClose}>Close</Button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'assign' ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-800">Assign to <span className="text-rose-500">*</span></span>
              <select value={personId} onChange={(event) => setPersonId(event.target.value)} required className={inputClass}>
                <option value="">Select a person</option>
                {eligiblePeople.map((person) => <option key={person._id} value={person._id}>{person.name}{person.reference ? ` (${person.reference})` : ''}</option>)}
              </select>
              {recordGroupId ? <span className="mt-1.5 block text-xs text-slate-500">Only active employees in {recordGroupName === '—' ? 'this group' : recordGroupName} can be assigned this record.</span> : null}
              {eligiblePeople.length === 0 ? <span className="mt-1.5 block text-xs font-medium text-rose-600">No active employees are available in this group.</span> : null}
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800">{mode === 'assign' ? 'Assignment date' : 'Return date'}</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800">Notes</span>
            <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context for the next person" className={inputClass} />
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting || (mode === 'assign' && eligiblePeople.length === 0)}>{submitting ? 'Saving…' : mode === 'assign' ? 'Assign record' : 'Return record'}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function RecordDetails({ record, recordTypes, onClose }: { record: WorkspaceRecord; recordTypes: RecordType[]; onClose: () => void }) {
  const [history, setHistory] = useState<RecordAssignmentHistory[] | null>(null)
  const populatedType = typeof record.recordTypeId === 'string' ? undefined : record.recordTypeId
  const type = populatedType ?? recordTypes.find((item) => item._id === getId(record.recordTypeId))

  useEffect(() => {
    void getRecordHistory(record._id).then(setHistory).catch(() => setHistory([]))
  }, [record._id])

  const details = [
    [domainConfig.identifierLabel, record.reference || 'Not provided'],
    ['Status', record.status],
    [domainConfig.categorySingular, getName(record.categoryId)],
    [domainConfig.groupSingular, getName(record.groupId)],
    [domainConfig.personSingular, getName(record.personId)],
    ['Location', record.location || 'Not provided'],
    [domainConfig.acquisitionDateLabel, formatDate(record.acquiredAt)],
    ['Created by', record.createdBy?.name || '—'],
    ['Created', formatTimestamp(record.createdAt)],
    ['Last updated', formatTimestamp(record.updatedAt)],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="record-details-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">{domainConfig.recordSingular} details</p>
            <h2 id="record-details-title" className="mt-1 text-2xl font-semibold text-slate-950">{record.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{getName(record.recordTypeId)}</p>
          </div>
          <Button type="button" onClick={onClose}>Close</Button>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd></div>)}
        </dl>

        {type?.fields.length ? (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-950">Additional information</h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {type.fields.map((field) => <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{field.label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{String(record.customFields?.[field.key] ?? 'Not provided')}</dd></div>)}
            </dl>
          </div>
        ) : null}

        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">History</p>
              <h3 className="mt-1 font-semibold text-slate-950">Assignment history</h3>
            </div>
            {history ? <span className="text-xs text-slate-400">{history.length} {history.length === 1 ? 'entry' : 'entries'}</span> : null}
          </div>
          {history === null ? <p className="mt-3 text-sm text-slate-500">Loading history…</p> : history.length === 0 ? <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No assignment history yet.</p> : (
            <div className="mt-3 space-y-3">
              {history.map((entry) => <div key={entry._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium text-slate-800">{entry.personId?.name ?? 'Unassigned'}</span><span className="text-xs text-slate-500">{entry.returnedAt ? `Returned ${formatDate(entry.returnedAt)}` : `Assigned ${formatDate(entry.assignedAt)}`}</span></div>{entry.notes || entry.returnNotes ? <p className="mt-2 text-slate-600">{entry.returnNotes || entry.notes}</p> : null}</div>)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function RecordsPage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<WorkspaceRecord[]>([])
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [form, setForm] = useState<RecordFormValue>({ ...emptyRecordForm })
  const [filters, setFilters] = useState<RecordFilters>({ ...emptyRecordFilters })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<WorkspaceRecord | null>(null)
  const [assigning, setAssigning] = useState<{ record: WorkspaceRecord; mode: 'assign' | 'return' } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    const [records, types, categoryList, groupList, peopleList] = await Promise.all([getRecords(), getRecordTypes(), getCategories(), getGroups(), getPeople()])
    setItems(records.items)
    setRecordTypes(types)
    setCategories(categoryList)
    setGroups(groupList)
    setPeople(peopleList)
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        await load()
      } catch (error) {
        setNotice({ type: 'error', message: getErrorMessage(error, `Unable to load ${domainConfig.recordPlural.toLowerCase()}.`) })
      }
    }
    void init()
  }, [load, setNotice])

  const selectedType = recordTypes.find((type) => type._id === form.recordTypeId)
  const statusOptions = useMemo(() => {
    const statuses = recordTypes.flatMap((type) => type.statuses.map((status) => ({ key: status.key, label: status.label })))
    return Array.from(new Map(statuses.map((status) => [status.key, status])).values())
  }, [recordTypes])

  const filtered = useMemo(() => items.filter((item) => {
    const search = filters.search.trim().toLowerCase()
    const typeId = getId(item.recordTypeId)
    const categoryId = getId(item.categoryId)
    return (!search || item.name.toLowerCase().includes(search) || item.reference?.toLowerCase().includes(search))
      && (filters.status === 'all' || item.status === filters.status)
      && (!filters.categoryId || categoryId === filters.categoryId)
      && (!filters.recordTypeId || typeId === filters.recordTypeId)
  }), [items, filters])

  const getRecordType = (record: WorkspaceRecord) => {
    const populated = typeof record.recordTypeId === 'string' ? undefined : record.recordTypeId
    return populated ?? recordTypes.find((type) => type._id === getId(record.recordTypeId))
  }

  const getStatusLabel = (record: WorkspaceRecord) => getRecordType(record)?.statuses.find((status) => status.key === record.status)?.label ?? domainConfig.statusLabels[record.status] ?? record.status

  const reset = () => {
    const firstType = recordTypes.find((type) => type.isActive) ?? recordTypes[0]
    setEditingId(null)
    setForm({ ...emptyRecordForm, recordTypeId: firstType?._id ?? '', status: firstType?.statuses[0]?.key ?? '' })
  }

  const submit = async () => {
    if (!form.name.trim()) {
      setNotice({ type: 'error', message: `Give this ${domainConfig.recordSingular.toLowerCase()} a name.` })
      return
    }
    if (!form.recordTypeId || !form.status) {
      setNotice({ type: 'error', message: `Choose a ${domainConfig.typeSingular.toLowerCase()} and a status before saving.` })
      return
    }

    setSubmitting(true)
    try {
      if (editingId) await updateRecord(editingId, form)
      else await createRecord(form)
      reset()
      await load()
      setNotice({ type: 'success', message: `${domainConfig.recordSingular} saved.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to save ${domainConfig.recordSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item: WorkspaceRecord) => {
    setEditingId(item._id)
    setForm({
      recordTypeId: getId(item.recordTypeId),
      name: item.name,
      reference: item.reference ?? '',
      status: item.status,
      categoryId: getId(item.categoryId),
      groupId: getId(item.groupId),
      location: item.location ?? '',
      acquiredAt: dateInputValue(item.acquiredAt),
      customFields: item.customFields ?? {},
    })
    window.requestAnimationFrame(() => document.getElementById('record-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${domainConfig.recordSingular.toLowerCase()}?`)) return
    setSubmitting(true)
    try {
      await deleteRecord(id)
      await load()
      setNotice({ type: 'success', message: `${domainConfig.recordSingular} deleted.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to delete ${domainConfig.recordSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  const submitAssignment = async (payload: Record<string, unknown>) => {
    if (!assigning) return
    setSubmitting(true)
    try {
      if (assigning.mode === 'assign') await assignRecord(assigning.record._id, payload)
      else await returnRecord(assigning.record._id, payload)
      setAssigning(null)
      await load()
      setNotice({ type: 'success', message: assigning.mode === 'assign' ? 'Record assigned.' : 'Record returned.' })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to update assignment.') })
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const exportFilters = Object.fromEntries(Object.entries(filters).filter(([key, value]) => key !== 'status' ? Boolean(value) : value !== 'all'))
      await downloadRecordsCsv(exportFilters)
      setNotice({ type: 'success', message: `${domainConfig.recordPlural} exported.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to export ${domainConfig.recordPlural.toLowerCase()}.`) })
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <PageHero
          eyebrow="Workspace activity"
          title={`Manage your ${domainConfig.recordPlural.toLowerCase()}`}
          description="Create, search, update, assign, and track everything your workspace needs to manage."
          actions={<Button type="button" variant="hero" onClick={() => void handleExport()} disabled={exporting}>{exporting ? 'Preparing export…' : 'Export visible records'}</Button>}
        />

        {canManage ? (
          <form id="record-form" onSubmit={(event) => { event.preventDefault(); void submit() }} className="space-y-6 border-b border-slate-200 p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{editingId ? 'Edit record' : 'Create a record'}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{editingId ? `Update this ${domainConfig.recordSingular.toLowerCase()}` : `Add a new ${domainConfig.recordSingular.toLowerCase()}`}</h3>
                <p className="mt-1 text-sm text-slate-500">Start with the type and name. The rest of the form adapts to the type you choose.</p>
              </div>
              {editingId ? <Button type="button" onClick={reset}>Cancel editing</Button> : null}
            </div>

            {recordTypes.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Create at least one active {domainConfig.typeSingular.toLowerCase()} before adding a {domainConfig.recordSingular.toLowerCase()}.</div>
            ) : null}

            <section>
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">1</span>
                <div><h4 className="font-semibold text-slate-950">What is this?</h4><p className="mt-1 text-sm text-slate-500">Choose a template and give the record a recognizable name.</p></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">{domainConfig.typeSingular} <span className="text-rose-500">*</span></span>
                  <select value={form.recordTypeId} onChange={(event) => { const type = recordTypes.find((item) => item._id === event.target.value); setForm((current) => ({ ...current, recordTypeId: event.target.value, status: type?.statuses[0]?.key ?? '', customFields: {} })) }} className={inputClass} required>
                    <option value="">Select {domainConfig.typeSingular.toLowerCase()}</option>
                    {recordTypes.filter((type) => type.isActive).map((type) => <option key={type._id} value={type._id}>{type.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">Name <span className="text-rose-500">*</span></span>
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={`For example, Main ${domainConfig.recordSingular.toLowerCase()}`} className={inputClass} required />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">{domainConfig.identifierLabel}</span>
                  <input value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} placeholder="Optional reference or ID" className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">Status <span className="text-rose-500">*</span></span>
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={inputClass} required disabled={!selectedType}>
                    <option value="">Select status</option>
                    {(selectedType?.statuses ?? []).map((status) => <option key={status.key} value={status.key}>{status.label}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">2</span>
                <div><h4 className="font-semibold text-slate-950">Where is it?</h4><p className="mt-1 text-sm text-slate-500">These fields are optional and help people find the record later.</p></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">{domainConfig.categorySingular}</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className={inputClass}><option value="">No {domainConfig.categorySingular.toLowerCase()}</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">{domainConfig.groupSingular}</span><select value={form.groupId} onChange={(event) => setForm((current) => ({ ...current, groupId: event.target.value }))} className={inputClass}><option value="">No {domainConfig.groupSingular.toLowerCase()}</option>{groups.filter((group) => group.isActive).map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}</select></label>
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">Location</span><input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Office, site, or address" className={inputClass} /></label>
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-800">{domainConfig.acquisitionDateLabel}</span><input type="date" value={form.acquiredAt} onChange={(event) => setForm((current) => ({ ...current, acquiredAt: event.target.value }))} className={inputClass} /></label>
              </div>
            </section>

            {selectedType?.fields.length ? (
              <section className="border-t border-slate-200 pt-6">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">3</span>
                  <div><h4 className="font-semibold text-slate-950">Additional information</h4><p className="mt-1 text-sm text-slate-500">Complete the extra fields defined for {selectedType.name}.</p></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">{selectedType.fields.map((field) => <Field key={field.key} definition={field} value={form.customFields[field.key]} onChange={(value) => setForm((current) => ({ ...current, customFields: { ...current.customFields, [field.key]: value } }))} />)}</div>
              </section>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              {editingId ? <Button type="button" onClick={reset}>Cancel</Button> : null}
              <Button type="submit" variant="primary" disabled={submitting || recordTypes.length === 0}>{submitting ? 'Saving…' : editingId ? `Save ${domainConfig.recordSingular.toLowerCase()}` : `Create ${domainConfig.recordSingular.toLowerCase()}`}</Button>
            </div>
          </form>
        ) : (
          <div className="m-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900 sm:m-8">
            <p className="font-semibold">You have read-only access to these records.</p>
            <p className="mt-1">Use the filters below to find a record and open it for more details.</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Workspace list</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Browse {domainConfig.recordPlural.toLowerCase()}</h3></div>
          <p className="text-sm text-slate-500">Showing {filtered.length} of {items.length}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder={`Search by name or ${domainConfig.identifierLabel.toLowerCase()}`} className={inputClass} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className={inputClass}><option value="all">All statuses</option>{statusOptions.map((status) => <option key={status.key} value={status.key}>{status.label}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{domainConfig.typeSingular}</span><select value={filters.recordTypeId} onChange={(event) => setFilters((current) => ({ ...current, recordTypeId: event.target.value }))} className={inputClass}><option value="">All types</option>{recordTypes.map((type) => <option key={type._id} value={type._id}>{type.name}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{domainConfig.categorySingular}</span><select value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))} className={inputClass}><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
            <Button type="button" onClick={() => setFilters({ ...emptyRecordFilters })}>Clear filters</Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="xl:col-span-2"><EmptyState title={items.length === 0 ? `No ${domainConfig.recordPlural.toLowerCase()} yet` : 'No matching records'} message={items.length === 0 ? `Create a ${domainConfig.recordSingular.toLowerCase()} above to start building your workspace.` : 'Try changing the search or clearing one of the filters.'} /></div>
          ) : filtered.map((item) => {
            const type = getRecordType(item)
            const assignedPerson = getName(item.personId)
            return (
              <article key={item._id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-200 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{getName(item.recordTypeId)}</p><h4 className="mt-1 truncate text-lg font-semibold text-slate-950">{item.name}</h4><p className="mt-1 text-sm text-slate-500">{item.reference || 'No reference added'}</p></div>
                  <span className="shrink-0 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{getStatusLabel(item)}</span>
                </div>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs uppercase tracking-wide text-slate-400">{domainConfig.categorySingular}</dt><dd className="mt-0.5 text-slate-700">{getName(item.categoryId)}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-400">{domainConfig.groupSingular}</dt><dd className="mt-0.5 text-slate-700">{getName(item.groupId)}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-400">Assigned to</dt><dd className="mt-0.5 text-slate-700">{assignedPerson === '—' ? 'No one' : assignedPerson}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt><dd className="mt-0.5 text-slate-700">{item.location || '—'}</dd></div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="accent" size="sm" onClick={() => setSelected(item)}>View details</Button>
                  {canManage ? <Button type="button" size="sm" onClick={() => startEdit(item)}>Edit</Button> : null}
                  {canManage && type?.assignment?.enabled ? <Button type="button" size="sm" onClick={() => setAssigning({ record: item, mode: item.personId ? 'return' : 'assign' })}>{item.personId ? 'Return' : 'Assign'}</Button> : null}
                  {canManage ? <Button type="button" variant="danger" size="sm" onClick={() => void remove(item._id)} disabled={submitting}>Delete</Button> : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {selected ? <RecordDetails key={selected._id} record={selected} recordTypes={recordTypes} onClose={() => setSelected(null)} /> : null}
      {assigning ? <AssignmentDialog record={assigning.record} people={people} mode={assigning.mode} submitting={submitting} onClose={() => setAssigning(null)} onSubmit={submitAssignment} /> : null}
    </PageShell>
  )
}
