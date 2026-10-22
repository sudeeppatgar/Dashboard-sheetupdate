import type { Category, MakeModel, Processor } from './types'
import { api } from '../../lib/api'

const unwrapList = <T>(response: { success: boolean; data: T[] }) => response.data

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<{ success: boolean; data: Category[] }>('/categories')
  return unwrapList(data)
}

export const getMakeModels = async (): Promise<MakeModel[]> => {
  const { data } = await api.get<{ success: boolean; data: MakeModel[] }>('/make-models')
  return unwrapList(data)
}

export const getProcessors = async (): Promise<Processor[]> => {
  const { data } = await api.get<{ success: boolean; data: Processor[] }>('/processors')
  return unwrapList(data)
}

export {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../lib/api'

export {
  createMakeModel,
  updateMakeModel,
  deleteMakeModel,
} from '../../lib/api'

export {
  createProcessor,
  updateProcessor,
  deleteProcessor,
} from '../../lib/api'
