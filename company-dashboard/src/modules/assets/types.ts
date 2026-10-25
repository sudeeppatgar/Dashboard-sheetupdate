import type { Category, MakeModel } from '../catalog/types'

export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired'

export type Asset = {
  _id: string
  fullName: string
  serialNumber?: string
  status?: AssetStatus
  transactionDate?: string
  location?: string
  condition?: string
  warrantyStartDate?: string
  warrantyEndDate?: string
  assignedEmployeeId?: string
  createdBy?: { _id: string; name: string; email?: string }
  categoryId?: Category
  makeModelId?: MakeModel
  createdAt?: string
  updatedAt?: string
}

export type AssetAssignmentHistory = {
  _id: string
  employeeId?: { name?: string }
  assignedAt?: string
  returnedAt?: string
  assetId?: Asset
}

export type MyAssetEntry = Asset | (AssetAssignmentHistory & { assetId: Asset })

export type AssetFormValue = {
  fullName: string
  categoryId: string
  makeModelId: string
  serialNumber: string
  status: AssetStatus
  transactionDate: string
  location: string
  condition: string
  warrantyStartDate: string
  warrantyEndDate: string
}

export type AssetFormErrors = Partial<Record<keyof AssetFormValue, string>>

export type AssetFilters = {
  search: string
  status: AssetStatus | 'all'
  categoryId: string
  makeModelId: string
}

export type AssetOption = {
  value: string
  label: string
}

export type AssetStatusOption = {
  value: AssetStatus
  label: string
}

export type AssetStatusCount = AssetStatusOption & {
  count: number
}
