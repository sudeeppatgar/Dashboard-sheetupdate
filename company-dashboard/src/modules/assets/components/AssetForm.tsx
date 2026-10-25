import { useState, type Dispatch, type SetStateAction } from 'react'
import FieldError from '../../../shared/components/FieldError'
import { assetStatusOptions } from '../constants'
import { validateAssetForm } from '../utils/validation'
import type { AssetFormValue, AssetOption, AssetStatus } from '../types'
import { domainConfig } from '../../../shared/config/domain'

type AssetFormProps = {
  form: AssetFormValue
  setForm: Dispatch<SetStateAction<AssetFormValue>>
  categoryOptions: AssetOption[]
  makeModelOptions: AssetOption[]
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
             {domainConfig.recordSingular} name <span className="text-rose-600">*</span>
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
             placeholder={`Enter a ${domainConfig.recordSingular.toLowerCase()} name`}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'asset-name-error' : undefined}
          />
          <FieldError id="asset-name-error" message={errors.fullName} />
        </label>

        <label className="block">
           <span className="mb-2 block text-sm font-medium text-slate-700">{domainConfig.identifierLabel}</span>
          <input
            value={form.serialNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                serialNumber: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
             placeholder="Optional reference"
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
             {domainConfig.categorySingular} <span className="text-rose-600">*</span>
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
             <option value="">Select {domainConfig.categorySingular.toLowerCase()}</option>
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
             {domainConfig.modelSingular} <span className="font-normal text-slate-400">(optional)</span>
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
             <option value="">Select {domainConfig.modelSingular.toLowerCase()}</option>
            {makeModelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">
             {domainConfig.acquisitionDateLabel} <span className="font-normal text-slate-400">(optional)</span>
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
             Add the date this {domainConfig.recordSingular.toLowerCase()} was acquired or recorded.
          </p>
          <FieldError
            id="asset-transaction-date-error"
            message={errors.transactionDate}
          />
        </label>
      </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Location</span>
          <input value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Condition</span>
          <select value={form.condition} onChange={(e) => setForm((c) => ({ ...c, condition: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {['new','good','fair','damaged','under_repair'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Coverage start</span>
          <input type="date" value={form.warrantyStartDate} onChange={(e) => setForm((c) => ({ ...c, warrantyStartDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Coverage end</span>
          <input type="date" value={form.warrantyEndDate} onChange={(e) => setForm((c) => ({ ...c, warrantyEndDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
           {submitting
             ? `Saving ${domainConfig.recordSingular.toLowerCase()}...`
             : editingId
               ? `Update ${domainConfig.recordSingular.toLowerCase()}`
               : `Add ${domainConfig.recordSingular.toLowerCase()}`}
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
