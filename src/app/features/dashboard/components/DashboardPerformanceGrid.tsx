import type { DashboardPerformanceMetric } from "../types"

type DashboardPerformanceGridProps = {
  metrics: DashboardPerformanceMetric[]
}

export const DashboardPerformanceGrid = ({
  metrics,
}: DashboardPerformanceGridProps) => {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {metric.value}
          </p>

          <p className="mt-2 text-sm text-slate-500">{metric.helper}</p>

          {typeof metric.progress === "number" ? (
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-950"
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
