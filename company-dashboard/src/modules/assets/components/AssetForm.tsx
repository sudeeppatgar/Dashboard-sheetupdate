import { useState, type Dispatch, type SetStateAction } from 'react'
import FieldError from '../../../shared/components/FieldError'
import { assetStatusOptions } from '../constants'
import { validateAssetForm } from '../utils/validation'
import type { AssetFormValue, AssetOption, AssetStatus } from '../types'

type AssetFormProps = {
  form: AssetFormValue
  setForm: Dispatch<SetStateAction<AssetFormValue>>
  categoryOptions: AssetOption[]
  makeModelOptions: AssetOption[]
  processorOptions: AssetOption[]
  editingId: string | null
  submitting: boolean
  onSubmit: () => Promise<void>
  onReset: () => void
}

function AssetForm({
  form,
  setForm,
  categoryOptions,
  makeModelOptions,
  processorOptions,
  editingId,
  submitting,
  onSubmit,
  onReset,
}: AssetFormProps) {
  const [validationAttempted, setValidationAttempted] = useState(false)
  const errors = validationAttempted ? validateAssetForm(form) : {}

  const handleSubmit = async () => {
    setValidationAttempted(true)
    if (Object.keys(validateAssetForm(form)).length > 0) return

    await onSubmit()
    setValidationAttempted(false)
  }

  const handleReset = () => {
    setValidationAttempted(false)
    onReset()
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Asset name <span className="text-rose-600">*</span>
          </span>
          <input
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 ${
              errors.fullName ? 'border-rose-300' : 'border-slate-200'
            }`}
            placeholder="Employee laptop"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'asset-name-error' : undefined}
          />
          <FieldError id="asset-name-error" message={errors.fullName} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Serial number</span>
          <input
            value={form.serialNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                serialNumber: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            placeholder="SN-1024"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as AssetStatus,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
          >
            {assetStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Category <span className="text-rose-600">*</span>
          </span>
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categoryId: event.target.value,
              }))
            }
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 ${
              errors.categoryId ? 'border-rose-300' : 'border-slate-200'
            }`}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={errors.categoryId ? 'asset-category-error' : undefined}
          >
            <option value="">Select category</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id="asset-category-error" message={errors.categoryId} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Make model <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <select
            value={form.makeModelId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                makeModelId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
          >
            <option value="">Select make model</option>
            {makeModelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Processor <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <select
            value={form.processorId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                processorId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
          >
            <option value="">Select processor</option>
            {processorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Purchase / transaction date <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            type="date"
            value={form.transactionDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                transactionDate: event.target.value,
              }))
            }
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 ${
              errors.transactionDate ? 'border-rose-300' : 'border-slate-200'
            }`}
            aria-invalid={Boolean(errors.transactionDate)}
            aria-describedby={errors.transactionDate ? 'asset-transaction-date-error' : undefined}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Add the date the asset was purchased or recorded.
          </p>
          <FieldError
            id="asset-transaction-date-error"
            message={errors.transactionDate}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving asset...' : editingId ? 'Update asset' : 'Add asset'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default AssetForm
