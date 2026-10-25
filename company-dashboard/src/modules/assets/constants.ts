import type { AssetFilters, AssetFormValue, AssetStatusOption } from './types'
import { domainConfig } from '../../shared/config/domain'

export const assetStatusOptions: AssetStatusOption[] = [
  { value: 'available', label: domainConfig.statusLabels.available },
  { value: 'assigned', label: domainConfig.statusLabels.assigned },
  { value: 'maintenance', label: domainConfig.statusLabels.maintenance },
  { value: 'retired', label: domainConfig.statusLabels.retired },
]

export const emptyAssetForm: AssetFormValue = {
  fullName: '',
  categoryId: '',
  makeModelId: '',
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
}
