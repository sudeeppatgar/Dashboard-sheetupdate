import { Navigate, Routes, Route } from 'react-router-dom'
import { AppProvider } from './shared/context/AppProvider'
import { useApp } from './shared/context/useApp'
import { Sidebar } from './shared/components/Sidebar'
import LoginPage from './modules/auth/components/LoginPage'
import DashboardPage from './modules/dashboard/components/DashboardPage'
import CategoriesPage from './modules/catalog/components/CategoriesPage'
import MakeModelsPage from './modules/catalog/components/MakeModelsPage'
import { DepartmentsPage } from './modules/departments/components/DepartmentsPage'
import { EmployeesPage } from './modules/employees/components/EmployeesPage'
import AssetsPage from './modules/assets/components/AssetsPage'
import MyAssetsPage from './modules/assets/components/MyAssetsPage'
import Notice from './shared/components/Notice'

function App() {
  const { isAuthenticated, notice, user } = useApp()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const isAdmin = user?.role === 'admin'
  const isEmployer = user?.role === 'employer'

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
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/make-models" element={<MakeModelsPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : isEmployer ? (
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<MyAssetsPage />} />
              <Route path="/my-assets" element={<MyAssetsPage />} />
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
