import { useState } from 'react'
import EmptyState from '../../../shared/components/EmptyState'
import FieldError from '../../../shared/components/FieldError'
import Button from '../../../shared/components/Button'
import PageHero from '../../../shared/components/PageHero'
import type { CatalogItem, NameResourceController, NameFormErrors } from '../types'
import { domainConfig } from '../../../shared/config/domain'

export type NameResourceSectionProps = NameResourceController & {
  title: string
  description: string
  items: CatalogItem[]
  submitting: boolean
  canManage: boolean
}

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100'

function NameResourceSection({
  title,
  description,
  items,
  form,
  setForm,
  editingId,
  onSubmit,
  onEdit,
  onDelete,
  onReset,
  submitting,
  canManage,
}: NameResourceSectionProps) {
  const [validationAttempted, setValidationAttempted] = useState(false)
  const resourceLabel = title.toLowerCase().replace(/ies$/, 'y').replace(/s$/, '')
  const errors: NameFormErrors = validationAttempted && !form.name.trim()
    ? { name: `Enter a ${resourceLabel} name.` }
    : {}

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setValidationAttempted(true)
    if (Object.keys(errors).length > 0) return

    await onSubmit()
    setValidationAttempted(false)
  }

  const handleReset = () => {
    setValidationAttempted(false)
    onReset()
  }

  return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <PageHero eyebrow="Workspace setup" title={`Organize your ${title.toLowerCase()}`} description={`${description} Keep names simple and consistent so people can find the right option when creating a record.`} />

      {canManage ? (
        <form onSubmit={(event) => void handleSubmit(event)} className="border-b border-slate-200 p-5 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{editingId ? 'Edit item' : 'Create an item'}</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{editingId ? `Update this ${resourceLabel}` : `Add a new ${resourceLabel}`}</h3>
              <p className="mt-1 text-sm text-slate-500">This name will appear as an option when people manage records.</p>
            </div>
            {editingId ? <Button type="button" onClick={handleReset}>Cancel editing</Button> : null}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label htmlFor={`${resourceLabel}-name`} className="mb-1.5 block text-sm font-medium text-slate-800">{resourceLabel.charAt(0).toUpperCase() + resourceLabel.slice(1)} name <span className="text-rose-500">*</span></label>
              <input
                id={`${resourceLabel}-name`}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={`${inputClass} ${errors.name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}`}
                placeholder={`For example, ${resourceLabel === 'category' ? 'Hardware' : 'General'}`}
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${resourceLabel}-error` : undefined}
              />
              <FieldError id={`${resourceLabel}-error`} message={errors.name} />
            </div>
            <Button type="submit" variant="primary" disabled={submitting} className="sm:mt-7">
              {submitting ? 'Saving…' : editingId ? `Save ${resourceLabel}` : `Add ${resourceLabel}`}
            </Button>
          </div>
        </form>
      ) : (
        <div className="m-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900 sm:m-8">
          <p className="font-semibold">These {title.toLowerCase()} are managed by administrators.</p>
          <p className="mt-1">You can use the available options when creating records.</p>
        </div>
      )}

      <div className="p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Saved options</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Available {title.toLowerCase()}</h3>
          </div>
          <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? 'option' : 'options'}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title={`No ${title.toLowerCase()} yet`}
                message={canManage ? `Add a ${resourceLabel} above to make it available for linked ${domainConfig.recordPlural.toLowerCase()}.` : `No ${title.toLowerCase()} are currently available to view.`}
              />
            </div>
          ) : items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-950">{item.name}</h4>
                  <p className="mt-1 text-xs text-slate-500">{item.createdAt ? `Added ${new Date(item.createdAt).toLocaleDateString()}` : 'Available for use'}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Available</span>
              </div>
              {canManage ? (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="accent" size="sm" onClick={() => onEdit(item)}>Edit</Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => void onDelete(item._id)} disabled={submitting}>Delete</Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NameResourceSection
