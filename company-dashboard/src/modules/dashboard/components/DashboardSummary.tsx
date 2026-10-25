import type { DashboardSummaryData } from '../types'
import { domainConfig } from '../../../shared/config/domain'

type DashboardSummaryProps = {
  data: DashboardSummaryData
}

function DashboardSummary({ data }: DashboardSummaryProps) {
  const resourceCounts = [
    { label: domainConfig.categoryPlural, value: data.totalCategories, color: 'bg-amber-50 text-amber-700' },
    { label: domainConfig.typePlural, value: data.totalRecordTypes, color: 'bg-violet-50 text-violet-700' },
    { label: domainConfig.recordPlural, value: data.totalRecords, color: 'bg-cyan-50 text-cyan-700' },
    { label: domainConfig.groupPlural, value: data.totalGroups, color: 'bg-emerald-50 text-emerald-700' },
    { label: domainConfig.personPlural, value: data.totalPeople, color: 'bg-blue-50 text-blue-700' },
  ]
  const statusCounts = Object.entries(data.byStatus)

  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">At a glance</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Your workspace today</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {resourceCounts.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border border-slate-200 px-4 py-4 ${item.color}`}
          >
            <p className="text-sm font-medium">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Progress</p>
              <h3 className="mt-1 font-semibold text-slate-950">Records by status</h3>
            </div>
            <span className="text-xs text-slate-400">{data.totalRecords} total</span>
          </div>
          {statusCounts.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {statusCounts.map(([status, count]) => (
                <div key={status} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    {domainConfig.statusLabels[status] ?? status}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Create a record to see workflow progress here.</div>
          )}
        </div>

        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Distribution</p>
              <h3 className="mt-1 font-semibold text-slate-950">Records by type</h3>
            </div>
            <span className="text-xs text-slate-400">Most used first</span>
          </div>
          {data.byType.length > 0 ? (
            <div className="mt-3 space-y-2">
              {data.byType.slice(0, 5).map((item) => (
                <div key={item.key ?? item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium text-slate-800">{item.name ?? item.key ?? 'Unnamed type'}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Create a record type and a record to see the distribution here.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardSummary
