import type { Asset } from '../assets/types'
import type { Category, MakeModel, Processor } from '../catalog/types'
import type { Department } from '../departments/types'
import type { Employee } from '../employees/types'

export type DashboardData = {
  categories: Category[]
  makeModels: MakeModel[]
  processors: Processor[]
  assets: Asset[]
  departments: Department[]
  employees: Employee[]
}
