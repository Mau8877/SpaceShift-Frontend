export type DashboardKpi = {
  id: string
  label: string
  value: string
  helper: string
}

export type DashboardChartItem = {
  label: string
  value: number
  color: string
}

export type DashboardPerformanceMetric = {
  id: string
  label: string
  value: string
  helper: string
  progress?: number
}

export type DashboardActivityItem = {
  id: string
  title: string
  description: string
  time: string
}

export type DashboardExpiringContract = {
  id: string
  property: string
  client: string
  type: string
  expiresAt: string
  daysLeft: number
}
