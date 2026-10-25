export type DashboardSummaryData = {
  totalCategories: number
  totalRecordTypes: number
  totalRecords: number
  totalGroups: number
  totalPeople: number
  byStatus: Record<string, number>
  byType: Array<{ key?: string; name?: string; count: number }>
}
