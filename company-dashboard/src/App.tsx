import { Navigate, Routes, Route } from 'react-router-dom'
import { AppProvider } from './shared/context/AppProvider'
import { useApp } from './shared/context/useApp'
import { Sidebar } from './shared/components/Sidebar'
import LoginPage from './modules/auth/components/LoginPage'
import DashboardPage from './modules/dashboard/components/DashboardPage'
import CategoriesPage from './modules/catalog/components/CategoriesPage'
import RecordTypesPage from './modules/record-types/components/RecordTypesPage'
import GroupsPage from './modules/groups/components/GroupsPage'
import PeoplePage from './modules/people/components/PeoplePage'
import RecordsPage from './modules/records/components/RecordsPage'
import Notice from './shared/components/Notice'

function App() {
  const { isAuthenticated, notice, user } = useApp()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const isAdmin = user?.role === 'admin'
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {notice ? <Notice notice={notice} className="mb-4" /> : null}
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/record-types" element={<RecordTypesPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<RecordsPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  )
}

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}
