import { useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { AppProvider } from './shared/context/AppProvider'
import { useApp } from './shared/context/useApp'
import { Sidebar } from './shared/components/Sidebar'
import LoginPage from './modules/auth/components/LoginPage'
import RegisterPage from './modules/auth/components/RegisterPage'
import LandingPage from './modules/auth/components/LandingPage'
import DashboardPage from './modules/dashboard/components/DashboardPage'
import CategoriesPage from './modules/catalog/components/CategoriesPage'
import RecordTypesPage from './modules/record-types/components/RecordTypesPage'
import GroupsPage from './modules/groups/components/GroupsPage'
import PeoplePage from './modules/people/components/PeoplePage'
import RecordsPage from './modules/records/components/RecordsPage'
import Notice from './shared/components/Notice'

function App() {
  const { isAuthenticated, notice, user } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((current) => !current)} />
      <div className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {!sidebarOpen ? <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="fixed left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">›</button> : null}
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
