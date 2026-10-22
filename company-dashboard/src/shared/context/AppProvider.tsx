import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '../../modules/auth/types'
import type { Notice } from '../../shared/types'
import { AppContext, type AppContextValue } from './AppContext'
import { clearSession, getSession, setSession } from '../../lib/storage'
import { login as loginApi } from '../../modules/auth/api'

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => getSession())
  const [notice, setNotice] = useState<Notice | null>(null)

  const user = session?.user ?? null
  const isAuthenticated = Boolean(session?.token)
  const canManage = user?.role === 'admin'

  const signIn = useCallback(async (email: string, password: string) => {
    const payload = await loginApi(email, password)
    const nextSession: Session = { token: payload.token, user: payload.user }
    setSession(nextSession)
    setSessionState(nextSession)
    return payload.user.name
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSessionState(null)
    setNotice({ type: 'success', message: 'Logged out.' })
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      user,
      isAuthenticated,
      canManage,
      notice,
      setNotice,
      signIn,
      signOut,
    }),
    [session, user, isAuthenticated, canManage, notice, setNotice, signIn, signOut]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppProvider
