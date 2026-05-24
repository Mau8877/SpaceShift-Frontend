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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Fila Superior: Buscador Full Width */}
      <div className="w-full">
        <label
          htmlFor="property-search"
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          Buscar inmueble
        </label>
        <div className="relative">
          <input
            id="property-search"
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Busca por título, zona, ciudad o tipo de inmueble..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
          />
        </div>
      </div>

      {/* Fila Inferior: Filtros de Estado y Transacción */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Estado de Publicación</p>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusChange(filter.value)}
                className={
                  status === filter.value
                    ? "rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-950/20 transition-all scale-105"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-slate-100 lg:h-12 lg:w-px" />

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Tipo de Transacción</p>
          <div className="flex flex-wrap gap-2">
            {transactionFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onTransactionChange(filter.value)}
                className={
                  transaction === filter.value
                    ? "rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-950/20 transition-all scale-105"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
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
