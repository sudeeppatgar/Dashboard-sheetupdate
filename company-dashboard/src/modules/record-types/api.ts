import type { RecordType, RecordTypePayload } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

export const getRecordTypes = async (): Promise<RecordType[]> => {
  const response = await http.get<ApiEnvelope<RecordType[]>>('/record-types')
  return unwrap(response)
}

export const createRecordType = async (payload: RecordTypePayload) => {
  const response = await http.post<ApiEnvelope<RecordType>>('/record-types', payload)
  return unwrap(response)
}

export const updateRecordType = async (id: string, payload: Partial<RecordTypePayload>) => {
  const response = await http.put<ApiEnvelope<RecordType>>(`/record-types/${id}`, payload)
  return unwrap(response)
}

export const deleteRecordType = async (id: string) => {
  await http.delete(`/record-types/${id}`)
}

export const toggleRecordTypeStatus = async (id: string, isActive: boolean) => {
  const response = await http.patch<ApiEnvelope<RecordType>>(`/record-types/${id}/status`, { isActive })
  return unwrap(response)
}
