import type { Dispatch, SetStateAction } from 'react'

export type Category = {
  _id: string
  name: string
  createdAt?: string
}

export type MakeModel = {
  _id: string
  name: string
  createdAt?: string
}

export type Processor = {
  _id: string
  name: string
  createdAt?: string
}

export type CatalogItem = Category | MakeModel | Processor

export type NameForm = {
  name: string
}

export type NameResourceController = {
  form: NameForm
  setForm: Dispatch<SetStateAction<NameForm>>
  editingId: string | null
  onSubmit: () => Promise<void>
  onEdit: (item: CatalogItem) => void
  onDelete: (id: string) => Promise<void>
  onReset: () => void
}
