import type { Category } from '../catalog/types'
import type { Group } from '../groups/types'
import type { Person } from '../people/types'
import type { RecordType } from '../record-types/types'

export type WorkspaceRecord = {
  _id: string
  name: string
  recordTypeId: RecordType | string
  reference?: string
  status: string
  categoryId?: Category | string
  groupId?: Group | string
  personId?: Person | string
  location?: string
  acquiredAt?: string
  customFields?: Record<string, unknown>
  createdBy?: { _id: string; name: string; email?: string }
  createdAt?: string
  updatedAt?: string
}

export type RecordAssignmentHistory = {
  _id: string
  personId?: Person
  assignedAt?: string
  returnedAt?: string
  returnNotes?: string
  notes?: string
}

export type RecordFormValue = {
  recordTypeId: string
  name: string
  reference: string
  status: string
  categoryId: string
  groupId: string
  location: string
  acquiredAt: string
  customFields: Record<string, unknown>
}

export type RecordFilters = {
  search: string
  status: string
  categoryId: string
  recordTypeId: string
}

export type RecordOption = { value: string; label: string }
