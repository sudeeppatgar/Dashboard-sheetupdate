import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { RegisterAdminPayload, Session } from '../../modules/auth/types'
import type { Notice } from '../../shared/types'
import { AppContext, type AppContextValue } from './AppContext'
import { clearSession, getSession, setSession } from '../../lib/storage'
import { login as loginApi, registerAdmin as registerAdminApi } from '../../modules/auth/api'

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(getSession)

  const user = session?.user ?? null
  const isAuthenticated = Boolean(session?.token)
  const canManage = user?.role === 'admin'

  const signIn = useCallback(async (email: string, password: string) => {
    const payload = await loginApi(email, password)
    const nextSession: Session = { token: payload.token, user: payload.user, workspace: payload.workspace }
    setSession(nextSession)
    setSessionState(nextSession)
    return payload.user.name
  }, [])

  const signUp = useCallback(async (payload: RegisterAdminPayload) => {
    const response = await registerAdminApi(payload)
    const nextSession: Session = { token: response.token, user: response.user, workspace: response.workspace }
    setSession(nextSession)
    setSessionState(nextSession)
    return response.user.name
  }, [])

  const setNotice = useCallback((notice: Notice | null) => {
    if (!notice) {
      toast.dismiss()
      return
    }

    if (notice.type === 'success') {
      toast.success(notice.message)
    } else {
      toast.error(notice.message)
    }
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSessionState(null)
    setNotice({ type: 'success', message: 'Logged out.' })
  }, [setNotice])

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      user,
      isAuthenticated,
      canManage,
      setNotice,
      signIn,
      signUp,
      signOut,
    }),
    [session, user, isAuthenticated, canManage, setNotice, signIn, signUp, signOut]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppProvider
