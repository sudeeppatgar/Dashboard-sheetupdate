export interface Department {
  _id: string
  name: string
  code: string
  description?: string
  isActive: boolean
  createdAt?: string
}

export interface DepartmentForm {
  name: string
  code: string
  description: string
  isActive: boolean
}
