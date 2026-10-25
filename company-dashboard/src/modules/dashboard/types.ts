export type DashboardSummaryData = {
  totalCategories: number
  totalMakeModels: number
  totalAssets: number
  totalDepartments: number
  totalEmployees: number
  byStatus: Record<string, number>
}
