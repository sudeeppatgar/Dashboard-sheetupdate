export type SessionUser = {
  _id: string
  name: string
  email: string
  role?: string
  workspaceId?: string
}

export type WorkspaceConfig = {
  appName?: string
  appTagline?: string
  recordSingular?: string
  recordPlural?: string
  categorySingular?: string
  categoryPlural?: string
  typeSingular?: string
  typePlural?: string
  groupSingular?: string
  groupPlural?: string
  personSingular?: string
  personPlural?: string
  identifierLabel?: string
  acquisitionDateLabel?: string
  statusLabels?: Record<string, string>
}

export type WorkspaceSummary = {
  _id: string
  name: string
  slug: string
  config: WorkspaceConfig
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
