import type { Group } from '../../groups/types'

export type Person = {
  _id: string
  name: string
  reference?: string
  email?: string
  userId?: string
  loginEnabled?: boolean
  groupId?: Group | string
  title?: string
  phone?: string
  location?: string
  isActive: boolean
}

export type PersonPayload = Partial<Omit<Person, '_id'>> & {
  password?: string
}
