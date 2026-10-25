import type { DashboardSummaryData } from './types'
import { http, type ApiEnvelope, unwrap } from '../../lib/http'

export const getDashboardSummary = async (): Promise<DashboardSummaryData> => {
  const response = await http.get<ApiEnvelope<DashboardSummaryData>>('/dashboard/summary')
  return unwrap(response)
}
