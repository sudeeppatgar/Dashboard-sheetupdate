import type { Group } from '../../groups/types'

export type Person = {
  _id: string
  name: string
  reference?: string
  email?: string
  groupId?: Group | string
  title?: string
  phone?: string
  location?: string
  isActive: boolean
}
