import { useState } from 'react'
import EmptyState from '../../../shared/components/EmptyState'
import FieldError from '../../../shared/components/FieldError'
import type { CatalogItem, NameResourceController, NameFormErrors } from '../types'

export type NameResourceSectionProps = NameResourceController & {
  title: string
  description: string
  items: CatalogItem[]
  submitting: boolean
  canManage: boolean
}

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
  const errors: NameFormErrors =
    validationAttempted && !form.name.trim()
      ? { name: `Enter a ${resourceLabel} name.` }
      : {}

  const handleSubmit = async () => {
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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {canManage ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 ${
                  errors.name ? 'border-rose-300' : 'border-slate-200'
                }`}
                placeholder={`Add ${title.toLowerCase()}`}
                aria-label={`${resourceLabel} name`}
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? `${resourceLabel.replaceAll(' ', '-')}-error` : undefined
                }
              />
              <FieldError
                id={`${resourceLabel.replaceAll(' ', '-')}-error`}
                message={errors.name}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Saving...'
                : editingId
                  ? `Update ${title.toLowerCase()}`
                  : `Add ${title.toLowerCase()}`}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access to {title.toLowerCase()}.
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[640px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Created</th>
              {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={canManage ? 3 : 2}>
                  <EmptyState
                    title={`No ${title.toLowerCase()} yet`}
                    message={
                      canManage
                        ? `Add a ${resourceLabel} to make it available for linked assets.`
                        : `No ${title.toLowerCase()} are currently available to view.`
                    }
                  />
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(item._id)}
                          disabled={submitting}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
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

export default NameResourceSection
