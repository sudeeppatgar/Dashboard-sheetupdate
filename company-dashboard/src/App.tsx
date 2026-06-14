import { useCallback, useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import {
  clearSession,
  getSession,
  setSession,
  type SessionUser,
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
  type Asset,
  type AssetFormValue,
  type Category,
  type MakeModel,
  type Processor,
  updateAsset,
  updateCategory,
  updateMakeModel,
  updateProcessor,
} from './lib/api'

type Notice = {
  type: 'success' | 'error'
  message: string
}

type NameForm = {
  name: string
}

type NameSectionProps = {
  title: string
  description: string
  items: Array<Category | MakeModel | Processor>
  form: NameForm
  setForm: Dispatch<SetStateAction<NameForm>>
  editingId: string | null
  onSubmit: () => Promise<void>
  onEdit: (item: Category | MakeModel | Processor) => void
  onDelete: (id: string) => Promise<void>
  onReset: () => void
  submitting: boolean
}

const emptyNameForm: NameForm = { name: '' }

const emptyAssetForm: AssetFormValue = {
  fullName: '',
  categoryId: '',
  makeModelId: '',
  processorId: '',
  serialNumber: '',
}

function App() {
  const [session, setSessionState] = useState(getSession())
  const [user, setUser] = useState<SessionUser | null>(getSession()?.user ?? null)
  const [loading, setLoading] = useState(Boolean(getSession()))
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [dashboardError, setDashboardError] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [makeModels, setMakeModels] = useState<MakeModel[]>([])
  const [processors, setProcessors] = useState<Processor[]>([])
  const [assets, setAssets] = useState<Asset[]>([])

  const [loginForm, setLoginForm] = useState({ email: 'admin@company.com', password: 'admin123' })

  const [categoryForm, setCategoryForm] = useState<NameForm>(emptyNameForm)
  const [makeModelForm, setMakeModelForm] = useState<NameForm>(emptyNameForm)
  const [processorForm, setProcessorForm] = useState<NameForm>(emptyNameForm)
  const [assetForm, setAssetForm] = useState<AssetFormValue>(emptyAssetForm)

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingMakeModelId, setEditingMakeModelId] = useState<string | null>(null)
  const [editingProcessorId, setEditingProcessorId] = useState<string | null>(null)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)

  const isAuthenticated = Boolean(session?.token)

  const handleLogout = useCallback((clearNotice = true) => {
    clearSession()
    setSessionState(null)
    setUser(null)
    setCategories([])
    setMakeModels([])
    setProcessors([])
    setAssets([])
    setCategoryForm(emptyNameForm)
    setMakeModelForm(emptyNameForm)
    setProcessorForm(emptyNameForm)
    setAssetForm(emptyAssetForm)
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
        setDashboardError('Session expired. Please log in again.')
      } else {
        setDashboardError(extractErrorMessage(error, 'Unable to load dashboard data.'))
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
      const nextSession = { token: payload.token, user: payload.user }

      setSession(nextSession)
      setSessionState(nextSession)
      setUser(payload.user)
      setNotice({ type: 'success', message: `Welcome back, ${payload.user.name}.` })
      await loadDashboard()
    } catch (error) {
      setNotice({
        type: 'error',
        message: extractErrorMessage(error, 'Login failed. Check your credentials.'),
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
        message: extractErrorMessage(error, 'Failed to save category.'),
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
        message: extractErrorMessage(error, 'Failed to save make model.'),
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
        message: extractErrorMessage(error, 'Failed to save processor.'),
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
        message: extractErrorMessage(error, 'Failed to save asset.'),
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
        message: extractErrorMessage(error, 'Delete failed.'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const categoryCount = categories.length
  const makeModelCount = makeModels.length
  const processorCount = processors.length
  const assetCount = assets.length

  const assetCategoryOptions = useMemo(
    () => categories.map((item) => ({ value: item._id, label: item.name })),
    [categories],
  )

  const assetMakeModelOptions = useMemo(
    () => makeModels.map((item) => ({ value: item._id, label: item.name })),
    [makeModels],
  )

  const assetProcessorOptions = useMemo(
    () => processors.map((item) => ({ value: item._id, label: item.name })),
    [processors],
  )

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_35%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">
                Company Dashboard
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Manage company assets from a clean table-first workspace.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Log in with the token-backed API, keep the session in localStorage,
                  and manage categories, make models, processors, and assets in one place.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Fast', 'Simple CRUD tables with inline edit actions.'],
                  ['Responsive', 'Works on small screens with horizontal table scroll.'],
                  ['Secure', 'Bearer token stored locally and attached to API calls.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-1 text-sm text-slate-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/10 bg-white p-6 text-slate-900 shadow-xl shadow-slate-950/10 sm:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-slate-500">
                Use the seeded admin account or your own backend user.
              </p>
            </div>

            {notice ? (
              <div
                className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                  notice.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {notice.message}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="admin@company.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <input
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="admin123"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in to dashboard'}
              </button>
            </form>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
                onClick={() => handleLogout()}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { label: 'Categories', value: categoryCount },
              { label: 'Make models', value: makeModelCount },
              { label: 'Processors', value: processorCount },
              { label: 'Assets', value: assetCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          {notice ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                notice.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {notice.message}
            </div>
          ) : null}

          {dashboardError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {dashboardError}
            </div>
          ) : null}
        </header>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
            Loading dashboard data...
          </div>
        ) : (
          <div className="space-y-6">
            <NameResourceSection
              title="Categories"
              description="Category rows are shared across assets."
              items={categories}
              form={categoryForm}
              setForm={setCategoryForm}
              editingId={editingCategoryId}
              submitting={submitting}
              onSubmit={handleCategorySubmit}
              onEdit={(item) => {
                setEditingCategoryId(item._id)
                setCategoryForm({ name: item.name })
              }}
              onDelete={(id) => handleDelete(id, deleteCategory, 'Category deleted.')}
              onReset={() => {
                setEditingCategoryId(null)
                setCategoryForm(emptyNameForm)
              }}
            />

            <NameResourceSection
              title="Make models"
              description="Keep make-model names simple and searchable."
              items={makeModels}
              form={makeModelForm}
              setForm={setMakeModelForm}
              editingId={editingMakeModelId}
              submitting={submitting}
              onSubmit={handleMakeModelSubmit}
              onEdit={(item) => {
                setEditingMakeModelId(item._id)
                setMakeModelForm({ name: item.name })
              }}
              onDelete={(id) => handleDelete(id, deleteMakeModel, 'Make model deleted.')}
              onReset={() => {
                setEditingMakeModelId(null)
                setMakeModelForm(emptyNameForm)
              }}
            />

            <NameResourceSection
              title="Processors"
              description="Processor records appear in the asset table as linked values."
              items={processors}
              form={processorForm}
              setForm={setProcessorForm}
              editingId={editingProcessorId}
              submitting={submitting}
              onSubmit={handleProcessorSubmit}
              onEdit={(item) => {
                setEditingProcessorId(item._id)
                setProcessorForm({ name: item.name })
              }}
              onDelete={(id) => handleDelete(id, deleteProcessor, 'Processor deleted.')}
              onReset={() => {
                setEditingProcessorId(null)
                setProcessorForm(emptyNameForm)
              }}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Assets</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Assets use linked category, make model, and processor values.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                    <input
                      value={assetForm.fullName}
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                      placeholder="Employee laptop"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Serial number</span>
                    <input
                      value={assetForm.serialNumber}
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          serialNumber: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                      placeholder="SN-1024"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
                    <select
                      value={assetForm.categoryId}
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          categoryId: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                    >
                      <option value="">Select category</option>
                      {assetCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Make model</span>
                    <select
                      value={assetForm.makeModelId}
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          makeModelId: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                    >
                      <option value="">Select make model</option>
                      {assetMakeModelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Processor</span>
                    <select
                      value={assetForm.processorId}
                      onChange={(event) =>
                        setAssetForm((current) => ({
                          ...current,
                          processorId: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                    >
                      <option value="">Select processor</option>
                      {assetProcessorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleAssetSubmit()}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingAssetId ? 'Update asset' : 'Add asset'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAssetId(null)
                      setAssetForm(emptyAssetForm)
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[920px] w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Asset</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Make model</th>
                      <th className="px-4 py-3 font-medium">Processor</th>
                      <th className="px-4 py-3 font-medium">Serial</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {assets.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                          No assets found.
                        </td>
                      </tr>
                    ) : (
                      assets.map((asset) => (
                        <tr key={asset._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{asset.fullName}</td>
                          <td className="px-4 py-3 text-slate-600">{asset.categoryId?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{asset.makeModelId?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{asset.processorId?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{asset.serialNumber ?? '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAssetId(asset._id)
                                  setAssetForm({
                                    fullName: asset.fullName,
                                    categoryId: asset.categoryId?._id ?? '',
                                    makeModelId: asset.makeModelId?._id ?? '',
                                    processorId: asset.processorId?._id ?? '',
                                    serialNumber: asset.serialNumber ?? '',
                                  })
                                }}
                                className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(asset._id, deleteAsset, 'Asset deleted.')}
                                disabled={submitting}
                                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

function NameResourceSection({
  title,
  description,
  items,
  form,
  setForm,
  editingId,
  onSubmit,
  onEdit,
  onDelete,
  onReset,
  submitting,
}: NameSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
            placeholder={`Add ${title.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingId ? `Update ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[640px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={3}>
                  No records found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(item._id)}
                        disabled={submitting}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as {
      response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }
    }).response

    const responseMessage = response?.data?.message
    const nestedMessage = response?.data?.errors?.[0]?.message

    return responseMessage || nestedMessage || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export default App
