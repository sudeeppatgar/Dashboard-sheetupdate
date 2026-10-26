import type { LoginResponse, RegisterAdminPayload } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

export const login = async (email: string, password: string) => {
  const response = await http.post<ApiEnvelope<LoginResponse>>('/auth/login', {
    email,
    password,
  })

  return unwrap(response)
}

export const registerAdmin = async (payload: RegisterAdminPayload) => {
  const response = await http.post<ApiEnvelope<LoginResponse>>('/auth/register', payload)
  return unwrap(response)
}
