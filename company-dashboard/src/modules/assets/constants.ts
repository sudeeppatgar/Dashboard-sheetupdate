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
  transactionDate: '',
  location: '',
  condition: 'good',
  warrantyStartDate: '',
  warrantyEndDate: '',
}

export const getDateInputValue = (value?: string) => {
  if (!value) return ''

  const dateOnlyValue = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (dateOnlyValue) return dateOnlyValue

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10)
}

export const emptyAssetFilters: AssetFilters = {
  search: '',
  status: 'all',
  categoryId: '',
  makeModelId: '',
  processorId: '',
}
