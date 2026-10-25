import type { Category, MakeModel } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

type CatalogListResponse<T> = ApiEnvelope<T[]>

export const getCategories = async (): Promise<Category[]> => {
  const response = await http.get<CatalogListResponse<Category>>('/categories')
  return unwrap(response)
}

export const getMakeModels = async (): Promise<MakeModel[]> => {
  const response = await http.get<CatalogListResponse<MakeModel>>('/make-models')
  return unwrap(response)
}

export const createCategory = async (name: string) => {
  const response = await http.post<ApiEnvelope<Category>>('/categories', { name })
  return unwrap(response)
}

export const updateCategory = async (id: string, name: string) => {
  const response = await http.put<ApiEnvelope<Category>>(`/categories/${id}`, { name })
  return unwrap(response)
}

export const deleteCategory = async (id: string) => {
  await http.delete(`/categories/${id}`)
}

export const createMakeModel = async (name: string) => {
  const response = await http.post<ApiEnvelope<MakeModel>>('/make-models', { name })
  return unwrap(response)
}

export const updateMakeModel = async (id: string, name: string) => {
  const response = await http.put<ApiEnvelope<MakeModel>>(`/make-models/${id}`, { name })
  return unwrap(response)
}

export const deleteMakeModel = async (id: string) => {
  await http.delete(`/make-models/${id}`)
}
