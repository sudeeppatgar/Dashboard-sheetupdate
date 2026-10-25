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

export type LoginFormValue = {
  email: string
  password: string
}

export type LoginResponse = {
  user: SessionUser
  token: string
}
