import type { AssetFormErrors, AssetFormValue } from '../types'

const isValidDateInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export const validateAssetForm = (form: AssetFormValue): AssetFormErrors => {
  const errors: AssetFormErrors = {}

  if (!form.fullName.trim()) {
    errors.fullName = 'Asset name is required.'
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Asset name must be at least 2 characters.'
  }

  if (!form.categoryId) {
    errors.categoryId = 'Choose a category for this asset.'
  }

  if (form.transactionDate && !isValidDateInput(form.transactionDate)) {
    errors.transactionDate = 'Enter a valid purchase or transaction date.'
  }

  return errors
}
