import type { DashboardKpi } from "../types"

type DashboardKpiGridProps = {
  kpis: DashboardKpi[]
}

export const DashboardKpiGrid = ({ kpis }: DashboardKpiGridProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <article
          key={kpi.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{kpi.value}</p>
          <p className="mt-2 text-sm text-slate-500">{kpi.helper}</p>
        </article>
      ))}
    </div>
  )
}
