import type { Asset, AssetAssignmentHistory, AssetFormValue, MyAssetEntry } from './types'
import { http, type ApiEnvelope } from '../../lib/http'

type AssetListResponse = ApiEnvelope<Asset[] | { items: Asset[] }>
type AssetActionPayload = Record<string, unknown>

const getAssetList = (payload: Asset[] | { items: Asset[] }) =>
  Array.isArray(payload) ? payload : payload.items

export const getAssets = async (): Promise<Asset[]> => {
  const { data } = await http.get<AssetListResponse>('/assets')
  return getAssetList(data.data)
}

export const getAssetAssignment = async (id: string) => {
  const { data } = await http.get<ApiEnvelope<unknown>>(`/assets/${id}/assignment`)
  return data.data
}

export const getAssetHistory = async (id: string) => {
  const { data } = await http.get<ApiEnvelope<AssetAssignmentHistory[]>>(`/assets/${id}/history`)
  return data.data
}

export const getMyAssets = async (): Promise<MyAssetEntry[]> => {
  const { data } = await http.get<ApiEnvelope<MyAssetEntry[]>>('/assets/my-assets')
  return data.data
}

export const assignAsset = async (id: string, payload: AssetActionPayload) => {
  const { data } = await http.post<ApiEnvelope<unknown>>(`/assets/${id}/assign`, payload)
  return data.data
}

export const returnAsset = async (id: string, payload: AssetActionPayload) => {
  const { data } = await http.post<ApiEnvelope<unknown>>(`/assets/${id}/return`, payload)
  return data.data
}

export const createAsset = async (payload: AssetFormValue) => {
  const { transactionDate, ...assetFields } = payload
  const requestPayload = transactionDate.trim()
    ? { ...assetFields, transactionDate: transactionDate.trim() }
    : assetFields
  const { data } = await http.post<ApiEnvelope<Asset>>('/assets', requestPayload)
  return data.data
}

export const updateAsset = async (id: string, payload: AssetFormValue) => {
  const { transactionDate, ...assetFields } = payload
  const requestPayload = {
    ...assetFields,
    transactionDate: transactionDate.trim() || null,
  }
  const { data } = await http.put<ApiEnvelope<Asset>>(`/assets/${id}`, requestPayload)
  return data.data
}

export const deleteAsset = async (id: string) => {
  await http.delete(`/assets/${id}`)
}

export const exportAssetsCsvUrl = (filters?: Record<string, string>) => {
  const params = new URLSearchParams(filters || {})
  return `${http.defaults.baseURL}/assets/export.csv?${params.toString()}`
}
