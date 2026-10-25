import axios from 'axios'
import { clearSession, getToken } from './storage'

const rawBaseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const normalizedBaseURL = rawBaseURL.replace(/\/$/, '')
const baseURL = normalizedBaseURL.endsWith('/api')
  ? normalizedBaseURL
  : `${normalizedBaseURL}/api`

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession()
    }

    return Promise.reject(error)
  },
)

export type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
}

export const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data
