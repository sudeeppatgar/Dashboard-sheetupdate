import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './shared/context/AppProvider'
import { formatDate, formatTimestamp } from './shared/utils/formatDate'
import { getErrorMessage } from './shared/utils/getErrorMessage'

describe('formatDate', () => {
  it('returns a fallback for missing values', () => {
    expect(formatDate(undefined)).toBe('Not provided')
    expect(formatDate('')).toBe('Not provided')
  })

  it('flags unparseable values', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date')
  })

  it('includes the year for valid values', () => {
    expect(formatDate('2024-03-05T10:00:00Z')).toMatch(/2024/)
  })
})

describe('formatTimestamp', () => {
  it('returns a fallback for missing values', () => {
    expect(formatTimestamp(undefined)).toBe('Not available')
  })
})

describe('getErrorMessage', () => {
  it('prefers the API response message', () => {
    const error = { response: { data: { message: 'Email already exists' } } }
    expect(getErrorMessage(error, 'fallback')).toBe('Email already exists')
  })

  it('falls back to the error message for generic errors', () => {
    expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
  })

  it('uses the fallback for unknown shapes', () => {
    expect(getErrorMessage(null, 'Something went wrong')).toBe('Something went wrong')
  })
})

describe('App', () => {
  it('shows the landing page for unauthenticated users', () => {
    window.localStorage.clear()
    render(
      <MemoryRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    )
    const heading = screen.getByRole('heading', { level: 1 })
    expect((heading.textContent ?? '')).toContain('shared source of truth')
  })
})
