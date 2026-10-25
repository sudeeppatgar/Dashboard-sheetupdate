import type { DashboardSummaryData } from '../types'
import { domainConfig } from '../../../shared/config/domain'

type DashboardSummaryProps = {
  data: DashboardSummaryData
}

function DashboardSummary({ data }: DashboardSummaryProps) {
  const resourceCounts = [
    { label: domainConfig.categoryPlural, value: data.totalCategories },
    { label: domainConfig.typePlural, value: data.totalRecordTypes },
    { label: domainConfig.recordPlural, value: data.totalRecords },
    { label: domainConfig.groupPlural, value: data.totalGroups },
    { label: domainConfig.personPlural, value: data.totalPeople },
  ]
  const statusCounts = Object.entries(data.byStatus)

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
        {statusCounts.map(([status, count]) => (
          <div key={status} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {domainConfig.statusLabels[status] ?? status}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{count}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default DashboardSummary
