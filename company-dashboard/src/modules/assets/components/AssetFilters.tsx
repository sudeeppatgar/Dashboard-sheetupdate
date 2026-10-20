import type { Dispatch, SetStateAction } from 'react'
import { assetStatusOptions, emptyAssetFilters } from '../constants'
import type { AssetFilters as AssetFiltersValue, AssetOption, AssetStatus } from '../types'

type AssetFiltersProps = {
  filters: AssetFiltersValue
  setFilters: Dispatch<SetStateAction<AssetFiltersValue>>
  categoryOptions: AssetOption[]
  makeModelOptions: AssetOption[]
  processorOptions: AssetOption[]
  filteredCount: number
  totalCount: number
}

function AssetFilters({
  filters,
  setFilters,
  categoryOptions,
  makeModelOptions,
  processorOptions,
  filteredCount,
  totalCount,
}: AssetFiltersProps) {
  const hasFilters =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    Boolean(filters.categoryId) ||
    Boolean(filters.makeModelId) ||
    Boolean(filters.processorId)

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-sm font-medium text-slate-700">Search assets</span>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            placeholder="Search by asset name or serial number"
          />
        </label>

        <label className="block lg:w-44">
          <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as AssetStatus | 'all',
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
          >
            <option value="all">All statuses</option>
            {assetStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block lg:w-44">
          <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
          <select
            value={filters.categoryId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, categoryId: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setFilters(emptyAssetFilters)}
          disabled={!hasFilters}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredCount} of {totalCount} assets
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="block sm:w-44">
            <span className="sr-only">Make model</span>
            <select
              aria-label="Filter by make model"
              value={filters.makeModelId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  makeModelId: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="">All make models</option>
              {makeModelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:w-44">
            <span className="sr-only">Processor</span>
            <select
              aria-label="Filter by processor"
              value={filters.processorId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  processorId: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            >
              <option value="">All processors</option>
              {processorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}

export default AssetFilters
