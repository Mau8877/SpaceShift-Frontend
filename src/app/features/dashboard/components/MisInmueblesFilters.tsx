import type { PropertyFilterStatus, PropertyFilterTransaction } from "../types"

type MisInmueblesFiltersProps = {
  search: string
  status: PropertyFilterStatus
  transaction: PropertyFilterTransaction
  onSearchChange: (value: string) => void
  onStatusChange: (value: PropertyFilterStatus) => void
  onTransactionChange: (value: PropertyFilterTransaction) => void
}

const statusFilters: Array<{
  label: string
  value: PropertyFilterStatus
}> = [
    {
      label: "Todos",
      value: "TODOS",
    },
    {
      label: "Disponibles",
      value: "DISPONIBLE",
    },
    {
      label: "Ocupados",
      value: "OCUPADO",
    },
    {
      label: "Inactivos",
      value: "INACTIVO",
    },
  ]

const transactionFilters: Array<{
  label: string
  value: PropertyFilterTransaction
}> = [
    {
      label: "Todos",
      value: "TODOS",
    },
    {
      label: "Venta",
      value: "VENTA",
    },
    {
      label: "Alquiler",
      value: "ALQUILER",
    },
    {
      label: "Anticrético",
      value: "ANTICRETICO",
    },
  ]

export const MisInmueblesFilters = ({
  search,
  status,
  transaction,
  onSearchChange,
  onStatusChange,
  onTransactionChange,
}: MisInmueblesFiltersProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <div>
          <label
            htmlFor="property-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Buscar inmueble
          </label>

          <input
            id="property-search"
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por título, zona, ciudad o tipo..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Estado</p>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusChange(filter.value)}
                className={
                  status === filter.value
                    ? "rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Transacción</p>

          <div className="flex flex-wrap gap-2">
            {transactionFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onTransactionChange(filter.value)}
                className={
                  transaction === filter.value
                    ? "rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
