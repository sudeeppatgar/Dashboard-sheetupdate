import type { LoginResponse } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

export const login = async (email: string, password: string) => {
  const response = await http.post<ApiEnvelope<LoginResponse>>('/auth/login', {
    email,
    password,
  })

  return unwrap(response)
}
