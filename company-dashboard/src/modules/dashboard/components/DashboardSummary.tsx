import { assetStatusOptions } from '../../assets/constants'
import type { AssetStatusCount } from '../../assets/types'
import type { DashboardSummaryData } from '../types'
import { domainConfig } from '../../../shared/config/domain'

type DashboardSummaryProps = {
  data: DashboardSummaryData
}

function DashboardSummary({ data }: DashboardSummaryProps) {
  const resourceCounts = [
    { label: domainConfig.categoryPlural, value: data.totalCategories },
    { label: domainConfig.modelPlural, value: data.totalMakeModels },
    { label: domainConfig.recordPlural, value: data.totalAssets },
    { label: domainConfig.groupPlural, value: data.totalDepartments },
    { label: domainConfig.personPlural, value: data.totalEmployees },
  ]

  const assetStatusCounts: AssetStatusCount[] = assetStatusOptions.map((option) => ({
    ...option,
    count: data.byStatus[option.value] ?? 0,
  }))

  return (
    <>
      <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
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
