import { Navigate, Routes, Route } from 'react-router-dom'
import { AppProvider } from './shared/context/AppProvider'
import { useApp } from './shared/context/useApp'
import { Sidebar } from './shared/components/Sidebar'
import LoginPage from './modules/auth/components/LoginPage'
import DashboardPage from './modules/dashboard/components/DashboardPage'
import CategoriesPage from './modules/catalog/components/CategoriesPage'
import MakeModelsPage from './modules/catalog/components/MakeModelsPage'
import ProcessorsPage from './modules/catalog/components/ProcessorsPage'
import { DepartmentsPage } from './modules/departments/components/DepartmentsPage'
import { EmployeesPage } from './modules/employees/components/EmployeesPage'
import Notice from './shared/components/Notice'

function App() {
  const { isAuthenticated, notice } = useApp()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        {notice ? <Notice notice={notice} className="mb-4" /> : null}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/make-models" element={<MakeModelsPage />} />
          <Route path="/processors" element={<ProcessorsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
