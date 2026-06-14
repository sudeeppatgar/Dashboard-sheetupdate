import axios from 'axios'
import { clearSession, getToken, type SessionUser } from './storage'

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

type LoginPayload = {
  user: SessionUser
  token: string
}

export type Category = {
  _id: string
  name: string
  createdAt?: string
}

export type MakeModel = {
  _id: string
  name: string
  createdAt?: string
}

export type Processor = {
  _id: string
  name: string
  createdAt?: string
}

export type Asset = {
  _id: string
  fullName: string
  serialNumber?: string
  transactionDate?: string
  categoryId?: Category
  makeModelId?: MakeModel
  processorId?: Processor
  createdAt?: string
}

export type DashboardData = {
  categories: Category[]
  makeModels: MakeModel[]
  processors: Processor[]
  assets: Asset[]
}

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data

export const login = async (email: string, password: string) => {
  const response = await api.post<ApiEnvelope<LoginPayload>>('/auth/login', {
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

export type AssetFormValue = {
  fullName: string
  categoryId: string
  makeModelId: string
  processorId: string
  serialNumber: string
}

export const createAsset = async (payload: AssetFormValue) => {
  const { data } = await api.post<ApiEnvelope<Asset>>('/assets', payload)
  return data.data
}

export const updateAsset = async (id: string, payload: AssetFormValue) => {
  const { data } = await api.put<ApiEnvelope<Asset>>(`/assets/${id}`, payload)
  return data.data
}

export const deleteAsset = async (id: string) => {
  await api.delete(`/assets/${id}`)
}
