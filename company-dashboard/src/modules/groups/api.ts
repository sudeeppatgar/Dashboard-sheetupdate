import type { Group } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

export const getGroups = async (): Promise<Group[]> => unwrap(await http.get<ApiEnvelope<Group[]>>('/groups'))
export const createGroup = async (payload: Partial<Group>) => unwrap(await http.post<ApiEnvelope<Group>>('/groups', payload))
export const updateGroup = async (id: string, payload: Partial<Group>) => unwrap(await http.put<ApiEnvelope<Group>>(`/groups/${id}`, payload))
export const deleteGroup = async (id: string) => { await http.delete(`/groups/${id}`) }
export const toggleGroupStatus = async (id: string, isActive: boolean) => unwrap(await http.patch<ApiEnvelope<Group>>(`/groups/${id}/status`, { isActive }))
