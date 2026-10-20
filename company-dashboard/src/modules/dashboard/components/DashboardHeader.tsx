import Notice from '../../../shared/components/Notice'
import type { Notice as NoticeValue } from '../../../shared/types'
import type { SessionUser } from '../../auth/types'
import type { DashboardData } from '../types'
import DashboardSummary from './DashboardSummary'

type DashboardHeaderProps = {
  user: SessionUser | null
  data: DashboardData
  notice: NoticeValue | null
  dashboardError: string
  onLogout: () => void
}

function DashboardHeader({ user, data, notice, dashboardError, onLogout }: DashboardHeaderProps) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Company Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the core backend tables from one responsive screen.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <p className="font-medium text-slate-900">{user?.name}</p>
            <p className="text-slate-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <DashboardSummary data={data} />

      {notice ? <Notice notice={notice} className="mt-4" /> : null}

      {dashboardError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {dashboardError}
        </div>
      ) : null}
    </header>
  )
}

export default DashboardHeader
