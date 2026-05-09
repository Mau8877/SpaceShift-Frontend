import type { DashboardActivityItem } from "../types"

type DashboardRecentActivityCardProps = {
  activities: DashboardActivityItem[]
}

export const DashboardRecentActivityCard = ({
  activities,
}: DashboardRecentActivityCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Actividad reciente
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Últimos movimientos importantes dentro de tu cuenta.
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {activity.title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {activity.description}
                </p>
              </div>

              <span className="shrink-0 text-xs font-medium text-slate-400">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
