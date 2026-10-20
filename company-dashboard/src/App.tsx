import { useCallback, useEffect, useState, type FormEvent } from 'react'
import LoginPage from './modules/auth/components/LoginPage'
import type { LoginFormValue, Session } from './modules/auth/types'
import type { AssetManagementProps } from './modules/assets/components/AssetManagement'
import { emptyAssetFilters, emptyAssetForm, getDateInputValue } from './modules/assets/constants'
import type { Asset, AssetFilters, AssetFormValue } from './modules/assets/types'
import type { NameResourceSectionProps } from './modules/catalog/components/NameResourceSection'
import { emptyNameForm } from './modules/catalog/constants'
import type { Category, MakeModel, NameForm, Processor } from './modules/catalog/types'
import DashboardPage from './modules/dashboard/components/DashboardPage'
import type { DashboardData } from './modules/dashboard/types'
import type { Notice } from './shared/types'
import { getErrorMessage } from './shared/utils/getErrorMessage'
import {
  clearSession,
  getSession,
  setSession,
} from './lib/storage'
import {
  createAsset,
  createCategory,
  createMakeModel,
  createProcessor,
  deleteAsset,
  deleteCategory,
  deleteMakeModel,
  deleteProcessor,
  fetchDashboard,
  login,
  updateAsset,
  updateCategory,
  updateMakeModel,
  updateProcessor,
} from './lib/api'

function App() {
  const [session, setSessionState] = useState<Session | null>(() => getSession())
  const [loading, setLoading] = useState(Boolean(session?.token))
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [dashboardError, setDashboardError] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [makeModels, setMakeModels] = useState<MakeModel[]>([])
  const [processors, setProcessors] = useState<Processor[]>([])
  const [assets, setAssets] = useState<Asset[]>([])

  const [loginForm, setLoginForm] = useState<LoginFormValue>({
    email: 'admin@company.com',
    password: 'admin123',
  })

  const [categoryForm, setCategoryForm] = useState<NameForm>(emptyNameForm)
  const [makeModelForm, setMakeModelForm] = useState<NameForm>(emptyNameForm)
  const [processorForm, setProcessorForm] = useState<NameForm>(emptyNameForm)
  const [assetForm, setAssetForm] = useState<AssetFormValue>(emptyAssetForm)
  const [assetFilters, setAssetFilters] = useState<AssetFilters>(emptyAssetFilters)

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingMakeModelId, setEditingMakeModelId] = useState<string | null>(null)
  const [editingProcessorId, setEditingProcessorId] = useState<string | null>(null)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)

  const user = session?.user ?? null
  const isAuthenticated = Boolean(session?.token)
  const canManage = user?.role === 'admin'

  const handleLogout = useCallback((clearNotice = true) => {
    clearSession()
    setSessionState(null)
    setCategories([])
    setMakeModels([])
    setProcessors([])
    setAssets([])
    setCategoryForm(emptyNameForm)
    setMakeModelForm(emptyNameForm)
    setProcessorForm(emptyNameForm)
    setAssetForm(emptyAssetForm)
    setAssetFilters(emptyAssetFilters)
    setEditingCategoryId(null)
    setEditingMakeModelId(null)
    setEditingProcessorId(null)
    setEditingAssetId(null)
    setDashboardError('')

    if (clearNotice) {
      setNotice({ type: 'success', message: 'Logged out.' })
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setDashboardError('')

    try {
      const data = await fetchDashboard()
      setCategories(data.categories)
      setMakeModels(data.makeModels)
      setProcessors(data.processors)
      setAssets(data.assets)
    } catch (error) {
      const status = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { status?: number; data?: { message?: string } } }).response?.status
        : undefined

      if (status === 401) {
        handleLogout(false)
        setNotice({ type: 'error', message: 'Session expired. Please log in again.' })
      } else {
        setDashboardError(getErrorMessage(error, 'Unable to load dashboard data.'))
      }
    } finally {
      setLoading(false)
    }
  }, [handleLogout])

  useEffect(() => {
    if (session?.token) {
      const timer = window.setTimeout(() => {
        void loadDashboard()
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [loadDashboard, session?.token])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setNotice(null)

    try {
      const payload = await login(loginForm.email, loginForm.password)
      const nextSession: Session = { token: payload.token, user: payload.user }

      setSession(nextSession)
      setSessionState(nextSession)
      setNotice({ type: 'success', message: `Welcome back, ${payload.user.name}.` })
      await loadDashboard()
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Login failed. Check your credentials.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const refreshAfterAction = useCallback(async (message: string) => {
    setNotice({ type: 'success', message })
    await loadDashboard()
  }, [loadDashboard])

  const handleCategorySubmit = async () => {
    const name = categoryForm.name.trim()
    if (!name) return

    setSubmitting(true)
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, name)
        setEditingCategoryId(null)
      } else {
        await createCategory(name)
      }
      setCategoryForm(emptyNameForm)
      await refreshAfterAction('Category saved.')
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save category.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleMakeModelSubmit = async () => {
    const name = makeModelForm.name.trim()
    if (!name) return

    setSubmitting(true)
    try {
      if (editingMakeModelId) {
        await updateMakeModel(editingMakeModelId, name)
        setEditingMakeModelId(null)
      } else {
        await createMakeModel(name)
      }
      setMakeModelForm(emptyNameForm)
      await refreshAfterAction('Make model saved.')
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save make model.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleProcessorSubmit = async () => {
    const name = processorForm.name.trim()
    if (!name) return

    setSubmitting(true)
    try {
      if (editingProcessorId) {
        await updateProcessor(editingProcessorId, name)
        setEditingProcessorId(null)
      } else {
        await createProcessor(name)
      }
      setProcessorForm(emptyNameForm)
      await refreshAfterAction('Processor saved.')
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save processor.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssetSubmit = async () => {
    if (!assetForm.fullName.trim() || !assetForm.categoryId) return

    setSubmitting(true)
    try {
      if (editingAssetId) {
        await updateAsset(editingAssetId, assetForm)
        setEditingAssetId(null)
      } else {
        await createAsset(assetForm)
      }

      setAssetForm(emptyAssetForm)
      await refreshAfterAction('Asset saved.')
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save asset.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (
    id: string,
    action: (targetId: string) => Promise<void>,
    successMessage: string,
  ) => {
    const confirmed = window.confirm('Delete this record?')
    if (!confirmed) return

    setSubmitting(true)
    try {
      await action(id)
      await refreshAfterAction(successMessage)
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Delete failed.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        form={loginForm}
        notice={notice}
        submitting={submitting}
        onEmailChange={(email) => setLoginForm((current) => ({ ...current, email }))}
        onPasswordChange={(password) => setLoginForm((current) => ({ ...current, password }))}
        onSubmit={handleLogin}
      />
    )
  }

  const data: DashboardData = { categories, makeModels, processors, assets }
  const resourceProps = {
    categories: {
      title: 'Categories',
      description: 'Category rows are shared across assets.',
      items: categories,
      form: categoryForm,
      setForm: setCategoryForm,
      editingId: editingCategoryId,
      submitting,
      onSubmit: handleCategorySubmit,
      onEdit: (item) => {
        setEditingCategoryId(item._id)
        setCategoryForm({ name: item.name })
      },
      onDelete: (id: string) => handleDelete(id, deleteCategory, 'Category deleted.'),
      onReset: () => {
        setEditingCategoryId(null)
        setCategoryForm(emptyNameForm)
      },
      canManage,
    } satisfies NameResourceSectionProps,
    makeModels: {
      title: 'Make models',
      description: 'Keep make-model names simple and searchable.',
      items: makeModels,
      form: makeModelForm,
      setForm: setMakeModelForm,
      editingId: editingMakeModelId,
      submitting,
      onSubmit: handleMakeModelSubmit,
      onEdit: (item) => {
        setEditingMakeModelId(item._id)
        setMakeModelForm({ name: item.name })
      },
      onDelete: (id: string) => handleDelete(id, deleteMakeModel, 'Make model deleted.'),
      onReset: () => {
        setEditingMakeModelId(null)
        setMakeModelForm(emptyNameForm)
      },
      canManage,
    } satisfies NameResourceSectionProps,
    processors: {
      title: 'Processors',
      description: 'Processor records appear in the asset table as linked values.',
      items: processors,
      form: processorForm,
      setForm: setProcessorForm,
      editingId: editingProcessorId,
      submitting,
      onSubmit: handleProcessorSubmit,
      onEdit: (item) => {
        setEditingProcessorId(item._id)
        setProcessorForm({ name: item.name })
      },
      onDelete: (id: string) => handleDelete(id, deleteProcessor, 'Processor deleted.'),
      onReset: () => {
        setEditingProcessorId(null)
        setProcessorForm(emptyNameForm)
      },
      canManage,
    } satisfies NameResourceSectionProps,
  }
  const assetProps: AssetManagementProps = {
    assets,
    categories,
    makeModels,
    processors,
    form: assetForm,
    setForm: setAssetForm,
    filters: assetFilters,
    setFilters: setAssetFilters,
    editingId: editingAssetId,
    submitting,
    canManage,
    onSubmit: handleAssetSubmit,
    onEdit: (asset) => {
      setEditingAssetId(asset._id)
      setAssetForm({
        fullName: asset.fullName,
        categoryId: asset.categoryId?._id ?? '',
        makeModelId: asset.makeModelId?._id ?? '',
        processorId: asset.processorId?._id ?? '',
        serialNumber: asset.serialNumber ?? '',
        status: asset.status ?? 'available',
        transactionDate: getDateInputValue(asset.transactionDate),
      })
    },
    onDelete: (id) => handleDelete(id, deleteAsset, 'Asset deleted.'),
    onResetForm: () => {
      setEditingAssetId(null)
      setAssetForm(emptyAssetForm)
    },
  }

  return (
    <DashboardPage
      data={data}
      user={user}
      loading={loading}
      notice={notice}
      dashboardError={dashboardError}
      onRetry={loadDashboard}
      onLogout={handleLogout}
      resources={resourceProps}
      assets={assetProps}
    />
  )
}

export default App
