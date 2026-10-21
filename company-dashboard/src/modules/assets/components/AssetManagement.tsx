import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import AssetFilters from './AssetFilters'
import AssetDetailPanel from './AssetDetailPanel'
import AssetForm from './AssetForm'
import AssetTable from './AssetTable'
import AssignmentDialog from './AssignmentDialog'
import { assignAsset, returnAsset } from '../../../lib/api'
import type { Asset, AssetFilters as AssetFiltersValue, AssetFormValue } from '../types'
import type { Category, MakeModel, Processor } from '../../catalog/types'
import type { Employee } from '../../employees/types'

export type AssetManagementProps = {
  assets: Asset[]
  categories: Category[]
  makeModels: MakeModel[]
  processors: Processor[]
  employees: Employee[]
  form: AssetFormValue
  setForm: Dispatch<SetStateAction<AssetFormValue>>
  filters: AssetFiltersValue
  setFilters: Dispatch<SetStateAction<AssetFiltersValue>>
  editingId: string | null
  submitting: boolean
  canManage: boolean
  onSubmit: () => Promise<void>
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => Promise<void>
  onResetForm: () => void
  onReload: () => Promise<void>
}

function AssetManagement({
  assets,
  categories,
  makeModels,
  processors,
  employees,
  form,
  setForm,
  filters,
  setFilters,
  editingId,
  submitting,
  canManage,
  onSubmit,
  onEdit,
  onDelete,
  onResetForm,
  onReload,
}: AssetManagementProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [assigningAsset, setAssigningAsset] = useState<Asset | null>(null)
  const [returningAsset, setReturningAsset] = useState<Asset | null>(null)
  const [dialogSubmitting, setDialogSubmitting] = useState(false)

  const handleAssign = async (payload: Record<string, unknown>) => {
    if (!assigningAsset) return
    setDialogSubmitting(true)
    try {
      await assignAsset(assigningAsset._id, payload)
      setAssigningAsset(null)
      await onReload()
    } finally {
      setDialogSubmitting(false)
    }
  }

  const handleReturn = async (payload: Record<string, unknown>) => {
    if (!returningAsset) return
    setDialogSubmitting(true)
    try {
      await returnAsset(returningAsset._id, payload)
      setReturningAsset(null)
      await onReload()
    } finally {
      setDialogSubmitting(false)
    }
  }

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item._id, label: item.name })),
    [categories],
  )

  const makeModelOptions = useMemo(
    () => makeModels.map((item) => ({ value: item._id, label: item.name })),
    [makeModels],
  )

  const processorOptions = useMemo(
    () => processors.map((item) => ({ value: item._id, label: item.name })),
    [processors],
  )

  const filteredAssets = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return assets.filter((asset) => {
      const assetStatus = asset.status ?? 'available'
      const matchesSearch =
        !search ||
        asset.fullName.toLowerCase().includes(search) ||
        asset.serialNumber?.toLowerCase().includes(search)
      const matchesStatus = filters.status === 'all' || assetStatus === filters.status
      const matchesCategory = !filters.categoryId || asset.categoryId?._id === filters.categoryId
      const matchesMakeModel =
        !filters.makeModelId || asset.makeModelId?._id === filters.makeModelId
      const matchesProcessor =
        !filters.processorId || asset.processorId?._id === filters.processorId

      return matchesSearch && matchesStatus && matchesCategory && matchesMakeModel && matchesProcessor
    })
  }, [assets, filters])

  const selectedAsset = selectedAssetId
    ? assets.find((asset) => asset._id === selectedAssetId)
    : undefined

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Assets</h2>
          <p className="mt-1 text-sm text-slate-500">
            Assets use linked category, make model, and processor values.
          </p>
        </div>
      </div>

      {canManage ? (
        <AssetForm
          form={form}
          setForm={setForm}
          categoryOptions={categoryOptions}
          makeModelOptions={makeModelOptions}
          processorOptions={processorOptions}
          editingId={editingId}
          submitting={submitting}
          onSubmit={onSubmit}
          onReset={onResetForm}
        />
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Contact an administrator to add or update assets.
        </div>
      )}

      <AssetFilters
        filters={filters}
        setFilters={setFilters}
        categoryOptions={categoryOptions}
        makeModelOptions={makeModelOptions}
        processorOptions={processorOptions}
        filteredCount={filteredAssets.length}
        totalCount={assets.length}
      />

      <AssetTable
        assets={filteredAssets}
        totalCount={assets.length}
        canManage={canManage}
        submitting={submitting}
        onViewDetails={(asset) => setSelectedAssetId(asset._id)}
        onEdit={onEdit}
        onDelete={(id) => void onDelete(id)}
        onAssign={setAssigningAsset}
        onReturn={setReturningAsset}
      />

      {selectedAsset ? (
        <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAssetId(null)} />
      ) : null}

      {assigningAsset ? (
        <AssignmentDialog
          asset={assigningAsset}
          mode="assign"
          employees={employees}
          submitting={dialogSubmitting}
          onClose={() => setAssigningAsset(null)}
          onSubmit={handleAssign}
        />
      ) : null}

      {returningAsset ? (
        <AssignmentDialog
          asset={returningAsset}
          mode="return"
          employees={employees}
          submitting={dialogSubmitting}
          onClose={() => setReturningAsset(null)}
          onSubmit={handleReturn}
        />
      ) : null}
    </section>
  )
}

export default AssetManagement
