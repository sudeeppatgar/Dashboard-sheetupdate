import type { Session } from '../modules/auth/types'

export type { Session, SessionUser } from '../modules/auth/types'

const SESSION_KEY = 'company-dashboard-session'

export const getSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as Session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export const setSession = (session: Session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}

export const getToken = () => getSession()?.token ?? ''
