export type RecordStatusDefinition = {
  key: string
  label: string
  terminal?: boolean
}

export type CustomFieldDefinition = {
  key: string
  label: string
  type: 'text' | 'multiline' | 'number' | 'date' | 'boolean' | 'select'
  required?: boolean
  options?: string[]
}

export type RecordType = {
  _id: string
  key: string
  name: string
  pluralName?: string
  description?: string
  statuses: RecordStatusDefinition[]
  fields: CustomFieldDefinition[]
  assignment?: {
    enabled: boolean
    assignedStatus: string
    availableStatus: string
  }
  isActive: boolean
  createdAt?: string
}

export type RecordTypePayload = Omit<RecordType, '_id' | 'createdAt'>
