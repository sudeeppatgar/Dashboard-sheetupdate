import type { Department } from './types'
import { http, type ApiEnvelope } from '../../lib/http'

type DepartmentListResponse = ApiEnvelope<Department[] | { items: Department[] }>

const getDepartmentList = (payload: Department[] | { items: Department[] }) =>
  Array.isArray(payload) ? payload : payload.items

export const getDepartments = async (): Promise<Department[]> => {
  const { data } = await http.get<DepartmentListResponse>('/departments')
  return getDepartmentList(data.data)
}

export const createDepartment = async (payload: Partial<Department>) => {
  const { data } = await http.post<ApiEnvelope<Department>>('/departments', payload)
  return data.data
}

export const updateDepartment = async (id: string, payload: Partial<Department>) => {
  const { data } = await http.put<ApiEnvelope<Department>>(`/departments/${id}`, payload)
  return data.data
}

export const deleteDepartment = async (id: string) => {
  await http.delete(`/departments/${id}`)
}

export const toggleDepartmentStatus = async (id: string, isActive: boolean) => {
  const { data } = await http.patch<ApiEnvelope<Department>>(`/departments/${id}/status`, { isActive })
  return data.data
}
