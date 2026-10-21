import axios from 'axios'
import type { LoginResponse } from '../modules/auth/types'
import type { Asset, AssetFormValue } from '../modules/assets/types'
import type { Category, MakeModel, Processor } from '../modules/catalog/types'
import type { DashboardData } from '../modules/dashboard/types'
import type { Department } from '../modules/departments/types'
import type { Employee } from '../modules/employees/types'
import { clearSession, getToken } from './storage'

const rawBaseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const baseURL = rawBaseURL.replace(/\/$/, '').endsWith('/api')
  ? rawBaseURL.replace(/\/$/, '')
  : `${rawBaseURL.replace(/\/$/, '')}/api`

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession()
    }

    return Promise.reject(error)
  },
)

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data: T
}

type ApiListEnvelope<T> = ApiEnvelope<T[]>

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data

export const login = async (email: string, password: string) => {
  const response = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', {
    email,
    password,
  })

  return unwrap(response)
}

export const fetchDashboard = async (): Promise<DashboardData> => {
  const [categories, makeModels, processors, assets] = await Promise.all([
    api.get<ApiListEnvelope<Category>>('/categories'),
    api.get<ApiListEnvelope<MakeModel>>('/make-models'),
    api.get<ApiListEnvelope<Processor>>('/processors'),
    api.get<ApiListEnvelope<Asset>>('/assets'),
  ])

  return {
    categories: unwrap(categories),
    makeModels: unwrap(makeModels),
    processors: unwrap(processors),
    assets: unwrap(assets),
  }
}

export const createCategory = async (name: string) => {
  const { data } = await api.post<ApiEnvelope<Category>>('/categories', { name })
  return data.data
}

export const updateCategory = async (id: string, name: string) => {
  const { data } = await api.put<ApiEnvelope<Category>>(`/categories/${id}`, {
    name,
  })
  return data.data
}

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`)
}
export const getAssetAssignment = async (id: string) => (await api.get(`/assets/${id}/assignment`)).data.data
export const getAssetHistory = async (id: string) => (await api.get(`/assets/${id}/history`)).data.data
export const assignAsset = async (id: string, payload: any) => (await api.post(`/assets/${id}/assign`, payload)).data.data
export const returnAsset = async (id: string, payload: any) => (await api.post(`/assets/${id}/return`, payload)).data.data
export const getEmployees = async (): Promise<Employee[]> => {
  const { data } = await api.get<any>('/employees')
  const payload = data?.data ?? data
  return Array.isArray(payload) ? payload : payload?.items ?? []
}
export const createEmployee = async (payload: any) => (await api.post('/employees', payload)).data.data
export const updateEmployee = async (id: string, payload: any) => (await api.put(`/employees/${id}`, payload)).data.data
export const deleteEmployee = async (id: string) => { await api.delete(`/employees/${id}`) }
export const toggleEmployeeStatus = async (id: string, isActive: boolean) => (await api.patch(`/employees/${id}/status`, { isActive })).data.data
export const getDepartments = async (): Promise<Department[]> => {
  const { data } = await api.get<any>('/departments')
  const payload = data?.data ?? data
  return Array.isArray(payload) ? payload : payload?.items ?? []
}
export const createDepartment = async (payload: Partial<Department>) => {
  const { data } = await api.post<ApiEnvelope<Department>>('/departments', payload)
  return data.data
}
export const updateDepartment = async (id: string, payload: Partial<Department>) => {
  const { data } = await api.put<ApiEnvelope<Department>>(`/departments/${id}`, payload)
  return data.data
}
export const deleteDepartment = async (id: string) => {
  await api.delete(`/departments/${id}`)
}
export const toggleDepartmentStatus = async (id: string, isActive: boolean) => {
  const { data } = await api.patch<ApiEnvelope<Department>>(`/departments/${id}/status`, { isActive })
  return data.data
}

export const createMakeModel = async (name: string) => {
  const { data } = await api.post<ApiEnvelope<MakeModel>>('/make-models', {
    name,
  })
  return data.data
}

export const updateMakeModel = async (id: string, name: string) => {
  const { data } = await api.put<ApiEnvelope<MakeModel>>(`/make-models/${id}`, {
    name,
  })
  return data.data
}

export const deleteMakeModel = async (id: string) => {
  await api.delete(`/make-models/${id}`)
}

export const createProcessor = async (name: string) => {
  const { data } = await api.post<ApiEnvelope<Processor>>('/processors', {
    name,
  })
  return data.data
}

export const updateProcessor = async (id: string, name: string) => {
  const { data } = await api.put<ApiEnvelope<Processor>>(`/processors/${id}`, {
    name,
  })
  return data.data
}

export const deleteProcessor = async (id: string) => {
  await api.delete(`/processors/${id}`)
}

export const createAsset = async (payload: AssetFormValue) => {
  const { transactionDate, ...assetFields } = payload
  const requestPayload = transactionDate.trim()
    ? { ...assetFields, transactionDate: transactionDate.trim() }
    : assetFields
  const { data } = await api.post<ApiEnvelope<Asset>>('/assets', requestPayload)
  return data.data
}

export const updateAsset = async (id: string, payload: AssetFormValue) => {
  const { transactionDate, ...assetFields } = payload
  const requestPayload = {
    ...assetFields,
    transactionDate: transactionDate.trim() || null,
  }
  const { data } = await api.put<ApiEnvelope<Asset>>(`/assets/${id}`, requestPayload)
  return data.data
}

export const deleteAsset = async (id: string) => {
  await api.delete(`/assets/${id}`)
}
