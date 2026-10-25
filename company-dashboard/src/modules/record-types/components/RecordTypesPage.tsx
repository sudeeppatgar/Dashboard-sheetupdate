import { useEffect, useState } from 'react'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import Button from '../../../shared/components/Button'
import PageHero from '../../../shared/components/PageHero'
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

type FieldForm = Omit<CustomFieldDefinition, 'options'> & {
  optionsText: string
}

type RecordTypeForm = {
  key: string
  name: string
  pluralName: string
  description: string
  statuses: RecordStatusDefinition[]
  fields: FieldForm[]
  assignmentEnabled: boolean
  assignedStatus: string
  availableStatus: string
  isActive: boolean
}

const defaultStatuses: RecordStatusDefinition[] = [
  { key: 'active', label: 'Active' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'completed', label: 'Completed', terminal: true },
]

const fieldTypeOptions: Array<{
  value: CustomFieldDefinition['type']
  label: string
  description: string
}> = [
  { value: 'text', label: 'Short text', description: 'Names, references, or short answers' },
  { value: 'multiline', label: 'Long text', description: 'Notes, summaries, or descriptions' },
  { value: 'select', label: 'Dropdown', description: 'Choose one option from a list' },
  { value: 'number', label: 'Number', description: 'Amounts, counts, or measurements' },
  { value: 'date', label: 'Date', description: 'A calendar date' },
  { value: 'boolean', label: 'Yes / No', description: 'A simple true or false answer' },
]

const createEmptyForm = (): RecordTypeForm => ({
  key: '',
  name: '',
  pluralName: '',
  description: '',
  statuses: defaultStatuses.map((status) => ({ ...status })),
  fields: [],
  assignmentEnabled: false,
  assignedStatus: 'in-progress',
  availableStatus: 'active',
  isActive: true,
})

const slugify = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const createStatus = (index: number): RecordStatusDefinition => ({
  key: `status-${index}`,
  label: 'New status',
  terminal: false,
})

const createField = (index: number): FieldForm => ({
  key: `field-${index}`,
  label: '',
  type: 'text',
  required: false,
  optionsText: '',
})

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100'

function getFormFields(item: RecordType): FieldForm[] {
  return item.fields.map((field) => ({
    ...field,
    optionsText: field.options?.join(', ') ?? '',
  }))
}

export default function RecordTypesPage() {
  const { canManage, setNotice } = useApp()
  const [items, setItems] = useState<RecordType[]>([])
  const [form, setForm] = useState<RecordTypeForm>(createEmptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => setItems(await getRecordTypes())

  useEffect(() => {
    const init = async () => {
      try {
        await load()
      } catch (error) {
        setNotice({ type: 'error', message: getErrorMessage(error, 'Unable to load record types.') })
      }
    }
    void init()
  }, [setNotice])

  const reset = () => {
    setEditingId(null)
    setForm(createEmptyForm())
  }

  const updateStatus = (index: number, changes: Partial<RecordStatusDefinition>) => {
    setForm((current) => ({
      ...current,
      statuses: current.statuses.map((status, statusIndex) => {
        if (statusIndex !== index) return status
        const next = { ...status, ...changes }
        if (changes.label !== undefined && (!status.key || status.key === slugify(status.label))) {
          next.key = slugify(changes.label) || status.key
        }
        return next
      }),
    }))
  }

  const updateField = (index: number, changes: Partial<FieldForm>) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field
        const next = { ...field, ...changes }
        if (changes.label !== undefined && (!field.key || field.key === slugify(field.label))) {
          next.key = slugify(changes.label) || field.key
        }
        return next
      }),
    }))
  }

  const validateForm = () => {
    const key = slugify(form.key || form.name)
    if (!form.name.trim()) return 'Give this record type a clear name.'
    if (!key) return 'Add a name or key using letters and numbers.'
    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(key)) return 'The key can use lowercase letters, numbers, hyphens, or underscores.'
    if (form.statuses.length === 0) return 'Add at least one status so records have a workflow.'

    const statusKeys = form.statuses.map((status) => slugify(status.key))
    if (form.statuses.some((status, index) => !status.label.trim() || !statusKeys[index])) return 'Every status needs a label and a key.'
    if (new Set(statusKeys).size !== statusKeys.length) return 'Status keys must be unique.'

    const fieldKeys = form.fields.map((field) => slugify(field.key))
    if (form.fields.some((field, index) => !field.label.trim() || !fieldKeys[index])) return 'Every custom field needs a label and a key.'
    if (new Set(fieldKeys).size !== fieldKeys.length) return 'Custom field keys must be unique.'
    if (form.fields.some((field) => field.type === 'select' && !field.optionsText.split(',').map((option) => option.trim()).filter(Boolean).length)) {
      return 'Dropdown fields need at least one option.'
    }

    if (form.assignmentEnabled) {
      if (!statusKeys.includes(slugify(form.assignedStatus)) || !statusKeys.includes(slugify(form.availableStatus))) {
        return 'Choose assignment statuses from the statuses listed above.'
      }
      if (slugify(form.assignedStatus) === slugify(form.availableStatus)) {
        return 'The assigned and available statuses must be different.'
      }
    }

    return null
  }

  const submit = async () => {
    const validationMessage = validateForm()
    if (validationMessage) {
      setNotice({ type: 'error', message: validationMessage })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        key: slugify(form.key || form.name),
        name: form.name.trim(),
        pluralName: form.pluralName.trim() || undefined,
        description: form.description.trim() || undefined,
        statuses: form.statuses.map((status) => ({
          key: slugify(status.key),
          label: status.label.trim(),
          terminal: Boolean(status.terminal),
        })),
        fields: form.fields.map((field) => ({
          key: slugify(field.key),
          label: field.label.trim(),
          type: field.type,
          required: Boolean(field.required),
          ...(field.type === 'select'
            ? { options: field.optionsText.split(',').map((option) => option.trim()).filter(Boolean) }
            : {}),
        })),
        assignment: {
          enabled: form.assignmentEnabled,
          assignedStatus: slugify(form.assignedStatus),
          availableStatus: slugify(form.availableStatus),
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
      statuses: item.statuses.map((status) => ({ ...status })),
      fields: getFormFields(item),
      assignmentEnabled: item.assignment?.enabled ?? false,
      assignedStatus: item.assignment?.assignedStatus ?? 'in-progress',
      availableStatus: item.assignment?.availableStatus ?? 'active',
      isActive: item.isActive,
    })
    window.requestAnimationFrame(() => document.getElementById('record-type-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${domainConfig.typeSingular.toLowerCase()}?`)) return
    setSubmitting(true)
    try {
      await deleteRecordType(id)
      await load()
      setNotice({ type: 'success', message: `${domainConfig.typeSingular} deleted.` })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, `Unable to delete ${domainConfig.typeSingular.toLowerCase()}.`) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <PageHero
          eyebrow="Workspace setup"
          title={`Define your ${domainConfig.typePlural.toLowerCase()}`}
          description={`A ${domainConfig.typeSingular.toLowerCase()} is a template for your records. Set up its workflow and the information people should fill in once, then reuse it everywhere.`}
        >
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            {[
              ['1', 'Name it', 'Give the type a name people understand.'],
              ['2', 'Set the workflow', 'Choose the statuses a record moves through.'],
              ['3', 'Add details', 'Add only the fields your team really needs.'],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300 text-xs font-bold text-slate-950">{number}</span>
                  <span className="font-semibold">{title}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </PageHero>

        {canManage ? (
          <form id="record-type-form" onSubmit={(event) => { event.preventDefault(); void submit() }} className="space-y-6 p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{editingId ? 'Edit template' : 'Create a template'}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{editingId ? `Update this ${domainConfig.typeSingular.toLowerCase()}` : `Add a new ${domainConfig.typeSingular.toLowerCase()}`}</h3>
                <p className="mt-1 text-sm text-slate-500">You can change these settings later without changing existing records.</p>
              </div>
              {editingId ? <Button type="button" onClick={reset}>Cancel editing</Button> : null}
            </div>

            <section>
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">1</span>
                <div>
                  <h4 className="font-semibold text-slate-950">Basic information</h4>
                  <p className="mt-1 text-sm text-slate-500">This is what people will see when they create or search for a record.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">Name <span className="text-rose-500">*</span></span>
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="For example, Support Case" className={inputClass} />
                  <span className="mt-1.5 block text-xs text-slate-500">Use a name your team will recognize.</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">Internal key</span>
                  <input value={form.key} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))} placeholder="support-case" className={inputClass} />
                  <span className="mt-1.5 block text-xs text-slate-500">Optional. Leave blank to create one from the name.</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">Plural name</span>
                  <input value={form.pluralName} onChange={(event) => setForm((current) => ({ ...current, pluralName: event.target.value }))} placeholder="Support Cases" className={inputClass} />
                  <span className="mt-1.5 block text-xs text-slate-500">Used in menus and list headings. Optional.</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-800">Short description</span>
                  <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Track customer support issues" className={inputClass} />
                  <span className="mt-1.5 block text-xs text-slate-500">Help people understand when to use this type.</span>
                </label>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">2</span>
                <div>
                  <h4 className="font-semibold text-slate-950">Workflow statuses</h4>
                  <p className="mt-1 text-sm text-slate-500">Statuses show the progress of a record, from start to finish.</p>
                </div>
              </div>
              <div className="space-y-3">
                {form.statuses.map((status, index) => (
                  <div key={`status-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status name</span>
                        <input value={status.label} onChange={(event) => updateStatus(index, { label: event.target.value })} placeholder="In progress" className={inputClass} />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Internal key</span>
                        <input value={status.key} onChange={(event) => updateStatus(index, { key: event.target.value })} placeholder="in-progress" className={inputClass} />
                      </label>
                      <label className="flex items-center gap-2 pb-3 text-sm text-slate-700 lg:whitespace-nowrap">
                        <input type="checkbox" checked={Boolean(status.terminal)} onChange={(event) => updateStatus(index, { terminal: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                        Final status
                      </label>
                      <button type="button" onClick={() => setForm((current) => ({ ...current, statuses: current.statuses.filter((_, statusIndex) => statusIndex !== index) }))} disabled={form.statuses.length === 1} className="mb-1 text-left text-sm font-medium text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-400 lg:mb-0">Remove</button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Mark a status as final when records should no longer be treated as active.</p>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={() => setForm((current) => ({ ...current, statuses: [...current.statuses, createStatus(current.statuses.length + 1)] }))} className="mt-3">+ Add another status</Button>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">3</span>
                <div>
                  <h4 className="font-semibold text-slate-950">Information to collect</h4>
                  <p className="mt-1 text-sm text-slate-500">Add the extra questions people should answer when creating this record. Keep it focused.</p>
                </div>
              </div>
              {form.fields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">No extra fields yet</p>
                  <p className="mt-1">The record will still have its name, reference, status, and description.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.fields.map((field, index) => (
                    <div key={`field-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Question or field name</span>
                          <input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} placeholder="Priority" className={inputClass} />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Internal key</span>
                          <input value={field.key} onChange={(event) => updateField(index, { key: event.target.value })} placeholder="priority" className={inputClass} />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Answer type</span>
                          <select value={field.type} onChange={(event) => updateField(index, { type: event.target.value as CustomFieldDefinition['type'] })} className={inputClass}>
                            {fieldTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </label>
                        <button type="button" onClick={() => setForm((current) => ({ ...current, fields: current.fields.filter((_, fieldIndex) => fieldIndex !== index) }))} className="mb-3 text-left text-sm font-medium text-rose-600 hover:text-rose-700 lg:mb-0">Remove</button>
                      </div>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-xs text-slate-500">{fieldTypeOptions.find((option) => option.value === field.type)?.description}</p>
                        <label className="flex shrink-0 items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={Boolean(field.required)} onChange={(event) => updateField(index, { required: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                          Required field
                        </label>
                      </div>
                      {field.type === 'select' ? (
                        <label className="mt-3 block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Dropdown options</span>
                          <input value={field.optionsText} onChange={(event) => updateField(index, { optionsText: event.target.value })} placeholder="Low, Medium, High" className={inputClass} />
                          <span className="mt-1.5 block text-xs text-slate-500">Separate choices with commas.</span>
                        </label>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              <Button type="button" onClick={() => setForm((current) => ({ ...current, fields: [...current.fields, createField(current.fields.length + 1)] }))} className="mt-3">+ Add a custom field</Button>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-800">4</span>
                <div>
                  <h4 className="font-semibold text-slate-950">Assignment and availability</h4>
                  <p className="mt-1 text-sm text-slate-500">Turn this on when a record can be owned or worked on by a person.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={form.assignmentEnabled} onChange={(event) => setForm((current) => ({ ...current, assignmentEnabled: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Allow assigning records to people</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">For example, assign a task to a team member or a case to an owner.</span>
                  </span>
                </label>
                {form.assignmentEnabled ? (
                  <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-800">Available status</span>
                      <select value={form.availableStatus} onChange={(event) => setForm((current) => ({ ...current, availableStatus: event.target.value }))} className={inputClass}>
                        {form.statuses.map((status) => <option key={status.key} value={status.key}>{status.label}</option>)}
                      </select>
                      <span className="mt-1.5 block text-xs text-slate-500">The status before someone takes ownership.</span>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-800">Assigned status</span>
                      <select value={form.assignedStatus} onChange={(event) => setForm((current) => ({ ...current, assignedStatus: event.target.value }))} className={inputClass}>
                        {form.statuses.map((status) => <option key={status.key} value={status.key}>{status.label}</option>)}
                      </select>
                      <span className="mt-1.5 block text-xs text-slate-500">The status after someone takes ownership.</span>
                    </label>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                Make this type available immediately
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                {editingId ? <Button type="button" onClick={reset}>Cancel</Button> : null}
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Saving…' : editingId ? `Save ${domainConfig.typeSingular.toLowerCase()}` : `Create ${domainConfig.typeSingular.toLowerCase()}`}</Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="m-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900 sm:m-8">
            <p className="font-semibold">These templates are managed by administrators.</p>
            <p className="mt-1">You can use the available types when creating records.</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Your templates</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Saved {domainConfig.typePlural.toLowerCase()}</h3>
          </div>
          <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? 'template' : 'templates'}</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {items.length === 0 ? (
            <div className="lg:col-span-2">
              <EmptyState title={`No ${domainConfig.typePlural.toLowerCase()} yet`} message={`Create your first ${domainConfig.typeSingular.toLowerCase()} above to start using the workspace.`} />
            </div>
          ) : items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-200 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-950">{item.name}</h4>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{item.key}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.isActive ? 'Available' : 'Hidden'}</span>
              </div>
              <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{item.description || `Used for creating ${item.pluralName?.toLowerCase() || item.name.toLowerCase()} records.`}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{item.statuses.length} {item.statuses.length === 1 ? 'status' : 'statuses'}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{item.fields.length} custom {item.fields.length === 1 ? 'field' : 'fields'}</span>
                {item.assignment?.enabled ? <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-700">Assignable</span> : null}
              </div>
              {canManage ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="accent" size="sm" onClick={() => startEdit(item)}>Edit template</Button>
                  <Button type="button" onClick={() => void toggleRecordTypeStatus(item._id, !item.isActive).then(load)} size="sm">{item.isActive ? 'Hide' : 'Make available'}</Button>
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
