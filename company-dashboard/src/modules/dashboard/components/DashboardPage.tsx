import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../../../shared/context/useApp'
import PageShell from '../../../shared/components/PageShell'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import ErrorState from '../../../shared/components/ErrorState'
import LoadingState from '../../../shared/components/LoadingState'
import { getDashboard } from '../api'
import type { DashboardData } from '../types'
import DashboardHeader from './DashboardHeader'
import AssetManagement from '../../assets/components/AssetManagement'

function DashboardPage() {
  const { user, signOut } = useApp()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setDashboardError('')

    try {
      const data = await getDashboard()
      setData(data)
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined

      if (status === 401) {
        signOut()
      } else {
        setDashboardError(getErrorMessage(error, 'Unable to load dashboard data.'))
      }
    } finally {
      setLoading(false)
    }
  }, [signOut])

  useEffect(() => {
    const init = async () => {
      await loadDashboard()
    }

    void init()
  }, [loadDashboard])

  return (
    <PageShell>
      {data ? <DashboardHeader user={user} data={data} onLogout={signOut} /> : null}

      {loading ? (
        <LoadingState message="Loading dashboard data..." />
      ) : dashboardError ? (
        <ErrorState message={dashboardError} onRetry={loadDashboard} />
      ) : (
        <div className="space-y-6">
          <AssetManagement />
        </div>
      )}
    </PageShell>
  )
}

export default DashboardPage
