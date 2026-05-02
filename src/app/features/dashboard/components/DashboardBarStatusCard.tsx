import type { DashboardChartItem } from "../types"

type DashboardBarStatusCardProps = {
  title: string
  description: string
  items: DashboardChartItem[]
}

export const DashboardBarStatusCard = ({
  title,
  description,
  items,
}: DashboardBarStatusCardProps) => {
  const total = items.reduce((acc, item) => acc + item.value, 0)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  <span className="text-sm font-medium text-slate-600">
                    {item.label}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-950">
                  {item.value}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
