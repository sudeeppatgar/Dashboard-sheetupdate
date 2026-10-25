import type { RecordFilters, RecordFormValue } from './types'

export const emptyRecordForm: RecordFormValue = {
  recordTypeId: '',
  name: '',
  reference: '',
  status: '',
  categoryId: '',
  groupId: '',
  location: '',
  acquiredAt: '',
  customFields: {},
}

export const emptyRecordFilters: RecordFilters = {
  search: '',
  status: 'all',
  categoryId: '',
  recordTypeId: '',
}

export const dateInputValue = (value?: string) => {
  if (!value) return ''
  const match = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (match) return match
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}
