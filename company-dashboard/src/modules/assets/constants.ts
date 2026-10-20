import type { AssetFilters, AssetFormValue, AssetStatusOption } from './types'

export const assetStatusOptions: AssetStatusOption[] = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'maintenance', label: 'Under repair' },
  { value: 'retired', label: 'Retired' },
]

export const emptyAssetForm: AssetFormValue = {
  fullName: '',
  categoryId: '',
  makeModelId: '',
  processorId: '',
  serialNumber: '',
  status: 'available',
}

export const emptyAssetFilters: AssetFilters = {
  search: '',
  status: 'all',
  categoryId: '',
  makeModelId: '',
  processorId: '',
}
