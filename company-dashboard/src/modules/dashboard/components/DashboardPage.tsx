import type { SessionUser } from '../../auth/types'
import AssetManagement, {
  type AssetManagementProps,
} from '../../assets/components/AssetManagement'
import NameResourceSection, {
  type NameResourceSectionProps,
} from '../../catalog/components/NameResourceSection'
import type { Notice } from '../../../shared/types'
import ErrorState from '../../../shared/components/ErrorState'
import LoadingState from '../../../shared/components/LoadingState'
import type { DashboardData } from '../types'
import DashboardHeader from './DashboardHeader'

type DashboardPageProps = {
  data: DashboardData
  user: SessionUser | null
  loading: boolean
  notice: Notice | null
  dashboardError: string
  onRetry: () => Promise<void>
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
  onRetry,
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
          onLogout={onLogout}
        />

        {loading ? (
          <LoadingState message="Loading dashboard data..." />
        ) : dashboardError ? (
          <ErrorState message={dashboardError} onRetry={onRetry} />
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
