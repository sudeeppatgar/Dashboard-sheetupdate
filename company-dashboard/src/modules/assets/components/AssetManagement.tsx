import { useEffect, useMemo, useState } from 'react'
import { assignAsset, createAsset, deleteAsset, getAssets, returnAsset, updateAsset } from '../api'
import { getCategories, getMakeModels, getProcessors } from '../../catalog/api'
import { getEmployees } from '../../employees/api'
import AssetDetailPanel from './AssetDetailPanel'
import AssetFilters from './AssetFilters'
import AssetForm from './AssetForm'
import AssetTable from './AssetTable'
import AssignmentDialog from './AssignmentDialog'
import { useCrudResource } from '../../../shared/hooks/useCrudResource'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import { useApp } from '../../../shared/context/useApp'
import type { Asset, AssetFormValue, AssetFilters as AssetFiltersValue } from '../types'
import type { Category, MakeModel, Processor } from '../../catalog/types'
import type { Employee } from '../../employees/types'
import { emptyAssetForm, emptyAssetFilters, getDateInputValue } from '../constants'

function AssetManagement() {
  const { canManage, setNotice } = useApp()
  const [form, setForm] = useState<AssetFormValue>(emptyAssetForm)
  const [filters, setFilters] = useState<AssetFiltersValue>(emptyAssetFilters)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [assigningAsset, setAssigningAsset] = useState<Asset | null>(null)
  const [returningAsset, setReturningAsset] = useState<Asset | null>(null)
  const [dialogSubmitting, setDialogSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [makeModels, setMakeModels] = useState<MakeModel[]>([])
  const [processors, setProcessors] = useState<Processor[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const assets = useCrudResource<Asset, AssetFormValue, AssetFormValue>({
    list: getAssets,
    create: createAsset,
    update: updateAsset,
    remove: deleteAsset,
  })

  useEffect(() => {
    const loadOptions = async () => {
      const [categoryList, makeModelList, processorList, employeeList] = await Promise.all([
        getCategories(),
        getMakeModels(),
        getProcessors(),
        getEmployees(),
      ])
      setCategories(categoryList)
      setMakeModels(makeModelList)
      setProcessors(processorList)
      setEmployees(employeeList)
    }

    void loadOptions()
  }, [])

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.categoryId) return

    try {
      if (editingId) {
        await assets.update(editingId, form)
        setEditingId(null)
      } else {
        await assets.create(form)
      }
      setForm(emptyAssetForm)
      setNotice({ type: 'success', message: 'Asset saved.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save asset.'),
      })
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this record?')
    if (!confirmed) return

    try {
      await assets.remove(id)
      setNotice({ type: 'success', message: 'Asset deleted.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Delete failed.'),
      })
    }
  }

  const handleEdit = (asset: Asset) => {
    setEditingId(asset._id)
    setForm({
      fullName: asset.fullName,
      categoryId: asset.categoryId?._id ?? '',
      makeModelId: asset.makeModelId?._id ?? '',
      processorId: asset.processorId?._id ?? '',
      serialNumber: asset.serialNumber ?? '',
      status: asset.status ?? 'available',
      transactionDate: getDateInputValue(asset.transactionDate),
      location: asset.location ?? '',
      condition: asset.condition ?? 'good',
      warrantyStartDate: getDateInputValue(asset.warrantyStartDate),
      warrantyEndDate: getDateInputValue(asset.warrantyEndDate),
    })
  }

  const handleResetForm = () => {
    setEditingId(null)
    setForm(emptyAssetForm)
  }

  const handleAssign = async (payload: Record<string, unknown>) => {
    if (!assigningAsset) return
    setDialogSubmitting(true)
    try {
      await assignAsset(assigningAsset._id, payload)
      setAssigningAsset(null)
      await assets.refresh()
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
      await assets.refresh()
    } finally {
      setDialogSubmitting(false)
    }
  }

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item._id, label: item.name })),
    [categories]
  )

  const makeModelOptions = useMemo(
    () => makeModels.map((item) => ({ value: item._id, label: item.name })),
    [makeModels]
  )

  const processorOptions = useMemo(
    () => processors.map((item) => ({ value: item._id, label: item.name })),
    [processors]
  )

  const filteredAssets = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return assets.items.filter((asset) => {
      const assetStatus = asset.status ?? 'available'
      const matchesSearch =
        !search ||
        asset.fullName.toLowerCase().includes(search) ||
        asset.serialNumber?.toLowerCase().includes(search)
      const matchesStatus = filters.status === 'all' || assetStatus === filters.status
      const matchesCategory = !filters.categoryId || asset.categoryId?._id === filters.categoryId
      const matchesMakeModel = !filters.makeModelId || asset.makeModelId?._id === filters.makeModelId
      const matchesProcessor = !filters.processorId || asset.processorId?._id === filters.processorId

      return matchesSearch && matchesStatus && matchesCategory && matchesMakeModel && matchesProcessor
    })
  }, [assets.items, filters])

  const selectedAsset = selectedAssetId
    ? assets.items.find((asset) => asset._id === selectedAssetId)
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

      <AssetForm
        form={form}
        setForm={setForm}
        categoryOptions={categoryOptions}
        makeModelOptions={makeModelOptions}
        processorOptions={processorOptions}
        editingId={editingId}
        submitting={assets.submitting}
        onSubmit={handleSubmit}
        onReset={handleResetForm}
      />

      <AssetFilters
        filters={filters}
        setFilters={setFilters}
        categoryOptions={categoryOptions}
        makeModelOptions={makeModelOptions}
        processorOptions={processorOptions}
        filteredCount={filteredAssets.length}
        totalCount={assets.items.length}
      />

      <AssetTable
        assets={filteredAssets}
        totalCount={assets.items.length}
        canManage={canManage}
        submitting={assets.submitting}
        onViewDetails={(asset) => setSelectedAssetId(asset._id)}
        onEdit={handleEdit}
        onDelete={(id) => void handleDelete(id)}
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
