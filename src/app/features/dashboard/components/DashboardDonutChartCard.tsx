import type { DashboardChartItem } from "../types"

type DashboardDonutChartCardProps = {
  title: string
  description: string
  items: DashboardChartItem[]
}

const buildDonutGradient = (items: DashboardChartItem[]) => {
  const total = items.reduce((acc, item) => acc + item.value, 0)

  if (total === 0) {
    return "#e2e8f0 0% 100%"
  }

  let current = 0

  return items
    .map((item) => {
      const start = current
      const end = current + (item.value / total) * 100

      current = end

      return `${item.color} ${start}% ${end}%`
    })
    .join(", ")
}

export const DashboardDonutChartCard = ({
  title,
  description,
  items,
}: DashboardDonutChartCardProps) => {
  const total = items.reduce((acc, item) => acc + item.value, 0)
  const gradient = buildDonutGradient(items)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="relative grid size-36 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${gradient})`,
          }}
        >
          <div className="grid size-24 place-items-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-950">{total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4"
            >
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
          ))}
        </div>
      </div>
    </article>
  )
}
