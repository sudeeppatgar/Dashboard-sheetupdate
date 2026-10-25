import type { RecordAssignmentHistory, RecordFormValue, WorkspaceRecord } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

type RecordListPayload = { items: WorkspaceRecord[]; pagination: { page: number; limit: number; totalItems: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }

export const getRecords = async (params?: Record<string, string>): Promise<RecordListPayload> => unwrap(await http.get<ApiEnvelope<RecordListPayload>>('/records', { params }))

const buildPayload = (form: RecordFormValue) => ({
  ...form,
  reference: form.reference.trim() || undefined,
  categoryId: form.categoryId || undefined,
  groupId: form.groupId || undefined,
  location: form.location.trim() || undefined,
  acquiredAt: form.acquiredAt || undefined,
})

export const createRecord = async (form: RecordFormValue) => unwrap(await http.post<ApiEnvelope<WorkspaceRecord>>('/records', buildPayload(form)))
export const updateRecord = async (id: string, form: RecordFormValue) => unwrap(await http.put<ApiEnvelope<WorkspaceRecord>>(`/records/${id}`, buildPayload(form)))
export const deleteRecord = async (id: string) => { await http.delete(`/records/${id}`) }
export const getRecordHistory = async (id: string) => unwrap(await http.get<ApiEnvelope<RecordAssignmentHistory[]>>(`/records/${id}/history`))
export const assignRecord = async (id: string, payload: Record<string, unknown>) => unwrap(await http.post<ApiEnvelope<unknown>>(`/records/${id}/assign`, payload))
export const returnRecord = async (id: string, payload: Record<string, unknown>) => unwrap(await http.post<ApiEnvelope<unknown>>(`/records/${id}/return`, payload))
export const exportRecordsCsvUrl = (filters?: Record<string, string>) => `${http.defaults.baseURL}/records/export.csv?${new URLSearchParams(filters || {}).toString()}`
