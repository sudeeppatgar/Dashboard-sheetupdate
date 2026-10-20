import type { Asset } from '../assets/types'
import type { Category, MakeModel, Processor } from '../catalog/types'

export type DashboardData = {
  categories: Category[]
  makeModels: MakeModel[]
  processors: Processor[]
  assets: Asset[]
}
