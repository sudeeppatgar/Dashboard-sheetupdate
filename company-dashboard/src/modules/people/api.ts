import type { Person, PersonPayload } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

export const getPeople = async (): Promise<Person[]> => unwrap(await http.get<ApiEnvelope<Person[]>>('/people'))
export const createPerson = async (payload: PersonPayload) => unwrap(await http.post<ApiEnvelope<Person>>('/people', payload))
export const updatePerson = async (id: string, payload: PersonPayload) => unwrap(await http.put<ApiEnvelope<Person>>(`/people/${id}`, payload))
export const deletePerson = async (id: string) => { await http.delete(`/people/${id}`) }
export const togglePersonStatus = async (id: string, isActive: boolean) => unwrap(await http.patch<ApiEnvelope<Person>>(`/people/${id}/status`, { isActive }))
