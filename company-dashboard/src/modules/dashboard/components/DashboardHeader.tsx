import type { SessionUser } from '../../auth/types'
import type { DashboardSummaryData } from '../types'
import DashboardSummary from './DashboardSummary'
import { domainConfig } from '../../../shared/config/domain'
import { Link } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import PageHero from '../../../shared/components/PageHero'

type DashboardHeaderProps = {
  user: SessionUser | null
  data: DashboardSummaryData
  onLogout: () => void
}

function DashboardHeader({ user, data, onLogout }: DashboardHeaderProps) {
  return (
    <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <PageHero
        eyebrow="Workspace overview"
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description={`${domainConfig.appTagline} Here is a simple view of what is in your workspace today.`}
        actions={(
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
              <p className="font-medium text-white">{user?.name}</p>
              <p className="text-slate-300">{user?.email}</p>
            </div>
            <Button type="button" onClick={onLogout}>Logout</Button>
          </div>
        )}
      />

      <div className="px-5 py-6 sm:px-8">
        <DashboardSummary data={data} />

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Shortcuts</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">What would you like to do?</h2>
            </div>
            <p className="text-sm text-slate-500">Jump directly to the part of the workspace you need.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/records', title: `Manage ${domainConfig.recordPlural.toLowerCase()}`, description: 'Create, search, assign, and update records.' },
              { to: '/record-types', title: `Configure ${domainConfig.typePlural.toLowerCase()}`, description: 'Set statuses and custom fields.' },
              { to: '/people', title: `Manage ${domainConfig.personPlural.toLowerCase()}`, description: 'Add people who can own records.' },
              { to: '/groups', title: `Organize ${domainConfig.groupPlural.toLowerCase()}`, description: 'Create reusable groups for your workspace.' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-cyan-700">Open page →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
