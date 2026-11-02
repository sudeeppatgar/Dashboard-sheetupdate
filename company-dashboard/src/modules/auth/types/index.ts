export type SessionUser = {
  _id: string
  name: string
  email: string
  role?: string
  workspaceId?: string
}

export type WorkspaceSummary = {
  _id: string
  name: string
  slug: string
  isActive?: boolean
}

export type Session = {
  token: string
  user: SessionUser
  workspace?: WorkspaceSummary | null
}

export type LoginFormValue = {
  email: string
  password: string
}

export type LoginResponse = {
  user: SessionUser
  token: string
  workspace?: WorkspaceSummary | null
}

export type RegisterAdminPayload = {
  workspaceName: string
  name: string
  email: string
  password: string
  confirmPassword: string
}
