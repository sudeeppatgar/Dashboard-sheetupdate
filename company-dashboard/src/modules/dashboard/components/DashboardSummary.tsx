import { assetStatusOptions } from '../../assets/constants'
import type { AssetStatusCount } from '../../assets/types'
import type { DashboardData } from '../types'

type DashboardSummaryProps = {
  data: DashboardData
}

function DashboardSummary({ data }: DashboardSummaryProps) {
  const resourceCounts = [
    { label: 'Categories', value: data.categories.length },
    { label: 'Make models', value: data.makeModels.length },
    { label: 'Processors', value: data.processors.length },
    { label: 'Assets', value: data.assets.length },
    { label: 'Departments', value: data.departments.length },
    { label: 'Employees', value: data.employees.length },
  ]

  const assetStatusCounts: AssetStatusCount[] = assetStatusOptions.map((option) => ({
    ...option,
    count: data.assets.filter((asset) => (asset.status ?? 'available') === option.value).length,
  }))

  return (
    <>
      <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {resourceCounts.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {assetStatusCounts.map((item) => (
          <div key={item.value} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{item.count}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default DashboardSummary
