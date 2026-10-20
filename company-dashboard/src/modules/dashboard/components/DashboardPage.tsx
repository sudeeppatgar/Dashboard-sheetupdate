import type { SessionUser } from '../../auth/types'
import AssetManagement, {
  type AssetManagementProps,
} from '../../assets/components/AssetManagement'
import NameResourceSection, {
  type NameResourceSectionProps,
} from '../../catalog/components/NameResourceSection'
import type { Notice } from '../../../shared/types'
import type { DashboardData } from '../types'
import DashboardHeader from './DashboardHeader'

type DashboardPageProps = {
  data: DashboardData
  user: SessionUser | null
  loading: boolean
  notice: Notice | null
  dashboardError: string
  onLogout: () => void
  resources: {
    categories: NameResourceSectionProps
    makeModels: NameResourceSectionProps
    processors: NameResourceSectionProps
  }
  assets: AssetManagementProps
}

function DashboardPage({
  data,
  user,
  loading,
  notice,
  dashboardError,
  onLogout,
  resources,
  assets,
}: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          user={user}
          data={data}
          notice={notice}
          dashboardError={dashboardError}
          onLogout={onLogout}
        />

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
            Loading dashboard data...
          </div>
        ) : (
          <div className="space-y-6">
            <NameResourceSection {...resources.categories} />
            <NameResourceSection {...resources.makeModels} />
            <NameResourceSection {...resources.processors} />
            <AssetManagement {...assets} />
          </div>
        )}
      </div>
    </main>
  )
}

export default DashboardPage
