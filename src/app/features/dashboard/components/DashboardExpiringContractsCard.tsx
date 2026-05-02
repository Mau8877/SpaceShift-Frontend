import type { DashboardExpiringContract } from "../types"

type DashboardExpiringContractsCardProps = {
  contracts: DashboardExpiringContract[]
}

export const DashboardExpiringContractsCard = ({
  contracts,
}: DashboardExpiringContractsCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Contratos por vencer
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Contratos activos que requieren seguimiento próximamente.
        </p>
      </div>

      <div className="grid gap-3">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {contract.property}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {contract.client} · {contract.type} · vence el{" "}
                {contract.expiresAt}
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {contract.daysLeft} días restantes
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
