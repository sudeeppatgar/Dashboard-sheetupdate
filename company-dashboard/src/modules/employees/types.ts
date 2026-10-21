export interface Employee {
  _id: string
  employeeNumber: string
  name: string
  email: string
  departmentId: { _id: string; name: string } | string
  jobTitle?: string
  phone?: string
  location?: string
  isActive: boolean
}
