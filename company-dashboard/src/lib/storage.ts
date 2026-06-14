export type SessionUser = {
  _id: string
  name: string
  email: string
  role?: string
}

export type Session = {
  token: string
  user: SessionUser
}

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
