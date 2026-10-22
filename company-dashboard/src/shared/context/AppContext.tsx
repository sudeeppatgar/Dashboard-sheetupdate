import { createContext } from 'react'
import type { Session, SessionUser } from '../../modules/auth/types'
import type { Notice } from '../../shared/types'

export type AppContextValue = {
  session: Session | null
  user: SessionUser | null
  isAuthenticated: boolean
  canManage: boolean
  notice: Notice | null
  setNotice: (notice: Notice | null) => void
  signIn: (email: string, password: string) => Promise<string>
  signOut: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)
