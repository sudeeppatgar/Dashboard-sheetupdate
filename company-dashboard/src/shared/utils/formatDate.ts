const getDatePart = (value: string) => value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]

const parseDate = (value: string) => {
  const datePart = getDatePart(value)
  const date = datePart ? new Date(`${datePart}T00:00:00`) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value?: string) => {
  if (!value) return 'Not provided'

  const date = parseDate(value)
  return date
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Invalid date'
}

export const formatTimestamp = (value?: string) => {
  if (!value) return 'Not available'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Invalid timestamp'
    : date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
}
