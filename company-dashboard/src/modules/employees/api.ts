import type { Employee } from './types'
import { http, type ApiEnvelope } from '../../lib/http'

type EmployeePayload = Record<string, unknown>

export const getEmployees = async (): Promise<Employee[]> => {
  const { data } = await http.get<ApiEnvelope<Employee[] | { items: Employee[] }>>('/users')
  const payload = data.data
  return Array.isArray(payload) ? payload : payload.items
}

export const createEmployee = async (payload: EmployeePayload) => {
  const { data } = await http.post<ApiEnvelope<Employee>>('/users', payload)
  return data.data
}

export const updateEmployee = async (id: string, payload: EmployeePayload) => {
  const { data } = await http.put<ApiEnvelope<Employee>>(`/users/${id}`, payload)
  return data.data
}

export const deleteEmployee = async (id: string) => {
  await http.delete(`/users/${id}`)
}

export const toggleEmployeeStatus = async (id: string, isActive: boolean) => {
  const { data } = await http.patch<ApiEnvelope<Employee>>(`/users/${id}/status`, { isActive })
  return data.data
}
