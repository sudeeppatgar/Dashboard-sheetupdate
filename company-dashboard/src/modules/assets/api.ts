import type { Asset } from './types'
import { api } from '../../lib/api'

export const getAssets = async (): Promise<Asset[]> => {
  const { data } = await api.get<{ success: boolean; data: Asset[] | { items: Asset[] } }>('/assets')
  const payload = data?.data ?? data
  return Array.isArray(payload) ? payload : payload?.items ?? []
}

export {
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getAssetAssignment,
  getAssetHistory,
} from '../../lib/api'
