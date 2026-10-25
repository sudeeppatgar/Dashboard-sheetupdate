import type { Category } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

type CatalogListResponse<T> = ApiEnvelope<T[]>

export const getCategories = async (): Promise<Category[]> => {
  const response = await http.get<CatalogListResponse<Category>>('/categories')
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
