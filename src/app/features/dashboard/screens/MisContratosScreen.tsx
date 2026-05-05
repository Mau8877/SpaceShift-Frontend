import type { ColumnDef, Row } from "@tanstack/react-table"
import { useMemo } from "react"

import { DataTable } from "@/components/DataTable"

import { misContratosMock } from "../mocks"
import type {
  ContractStatus,
  ContractType,
  DashboardContract,
} from "../types"

const contractTypeLabels: Record<ContractType, string> = {
  ALQUILER: "Alquiler",
  VENTA: "Venta",
  ANTICRETICO: "Anticretico",
  RESERVA_TEMPORAL: "Reserva temporal",
}

const contractStatusLabels: Record<ContractStatus, string> = {
  ACTIVO: "Activo",
  POR_VENCER: "Por vencer",
  VENCIDO: "Vencido",
  BORRADOR: "Borrador",
}

const getContractTypeClassName = (type: ContractType) => {
  if (type === "ALQUILER") {
    return "bg-blue-50 text-blue-700 ring-blue-200"
  }

  if (type === "VENTA") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }

  if (type === "ANTICRETICO") {
    return "bg-purple-50 text-purple-700 ring-purple-200"
  }

  return "bg-orange-50 text-orange-700 ring-orange-200"
}

const getContractStatusClassName = (status: ContractStatus) => {
  if (status === "ACTIVO") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }

  if (status === "POR_VENCER") {
    return "bg-amber-50 text-amber-700 ring-amber-200"
  }

  if (status === "VENCIDO") {
    return "bg-rose-50 text-rose-700 ring-rose-200"
  }

  return "bg-slate-50 text-slate-600 ring-slate-200"
}

const formatAmount = (moneda: string, amount: number) => {
  return `${moneda} ${amount.toLocaleString("es-BO")}`
}

const equalsFilter = (
  row: Row<DashboardContract>,
  columnId: string,
  filterValue: unknown
) => {
  return row.getValue(columnId) === filterValue
}

const ContractTypeBadge = ({ type }: { type: ContractType }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getContractTypeClassName(
        type
      )}`}
    >
      {contractTypeLabels[type]}
    </span>
  )
}

const ContractStatusBadge = ({ status }: { status: ContractStatus }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getContractStatusClassName(
        status
      )}`}
    >
      {contractStatusLabels[status]}
    </span>
  )
}

const ContratoMobileCard = ({ contract }: { contract: DashboardContract }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{contract.codigo}</p>
          <p className="mt-1 text-sm text-slate-500">{contract.cliente}</p>
        </div>

        <ContractStatusBadge status={contract.estado} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ContractTypeBadge type={contract.tipoContrato} />
        {contract.renovacionAutomatica ? (
          <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200">
            Renovacion auto
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Inmueble</p>
          <p className="text-sm font-semibold text-slate-800">
            {contract.inmueble}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500">Inicio</p>
            <p className="text-sm font-semibold text-slate-800">
              {contract.fechaInicio}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Fin</p>
            <p className="text-sm font-semibold text-slate-800">
              {contract.fechaFin}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Monto</p>
          <p className="text-sm font-semibold text-slate-800">
            {formatAmount(contract.moneda, contract.monto)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-400">
        Ultima actividad: {contract.ultimaActualizacion}
      </p>
    </article>
  )
}

export const MisContratosScreen = () => {
  const summary = useMemo(() => {
    return {
      total: misContratosMock.length,
      activos: misContratosMock.filter((contract) => contract.estado === "ACTIVO")
        .length,
      porVencer: misContratosMock.filter(
        (contract) => contract.estado === "POR_VENCER"
      ).length,
      vencidos: misContratosMock.filter((contract) => contract.estado === "VENCIDO")
        .length,
    }
  }, [])

  const columns = useMemo<Array<ColumnDef<DashboardContract>>>(
    () => [
      {
        id: "codigo",
        accessorFn: (row) => `${row.codigo} ${row.cliente} ${row.inmueble}`,
        header: "Contrato",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-950">{row.original.codigo}</p>
            <p className="mt-1 text-xs text-slate-500">{row.original.cliente}</p>
          </div>
        ),
      },
      {
        accessorKey: "tipoContrato",
        header: "Tipo",
        filterFn: equalsFilter,
        cell: ({ row }) => <ContractTypeBadge type={row.original.tipoContrato} />,
      },
      {
        accessorKey: "inmueble",
        header: "Inmueble",
        cell: ({ row }) => (
          <div className="max-w-[240px]">
            <p className="line-clamp-2 font-medium text-slate-800">
              {row.original.inmueble}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        filterFn: equalsFilter,
        cell: ({ row }) => <ContractStatusBadge status={row.original.estado} />,
      },
      {
        id: "vigencia",
        accessorFn: (row) => `${row.fechaInicio} ${row.fechaFin}`,
        header: "Vigencia",
        cell: ({ row }) => (
          <div>
            <p className="text-xs text-slate-500">Inicio: {row.original.fechaInicio}</p>
            <p className="text-xs text-slate-500">Fin: {row.original.fechaFin}</p>
          </div>
        ),
      },
      {
        accessorKey: "monto",
        header: "Monto",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {formatAmount(row.original.moneda, row.original.monto)}
          </span>
        ),
      },
      {
        accessorKey: "ultimaActualizacion",
        header: "Ultima actividad",
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">
            {row.original.ultimaActualizacion}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Contratos registrados
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Revisa los contratos asociados a tus inmuebles y su estado actual.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total contratos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{summary.total}</p>
          <p className="mt-2 text-sm text-slate-500">Registrados en tu cuenta</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Activos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{summary.activos}</p>
          <p className="mt-2 text-sm text-slate-500">En ejecucion actualmente</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Por vencer</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.porVencer}
          </p>
          <p className="mt-2 text-sm text-slate-500">Requieren seguimiento</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Vencidos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.vencidos}
          </p>
          <p className="mt-2 text-sm text-slate-500">Pendientes de renovacion</p>
        </article>
      </div>

      <DataTable
        columns={columns}
        data={misContratosMock}
        search={{
          enabled: true,
          placeholder: "Buscar contrato, cliente o inmueble...",
        }}
        filters={[
          {
            id: "tipoContrato",
            label: "Tipo",
            columnId: "tipoContrato",
            options: [
              { label: "Todos", value: "all" },
              { label: "Alquiler", value: "ALQUILER" },
              { label: "Venta", value: "VENTA" },
              { label: "Anticretico", value: "ANTICRETICO" },
              { label: "Reserva temporal", value: "RESERVA_TEMPORAL" },
            ],
          },
          {
            id: "estado",
            label: "Estado",
            columnId: "estado",
            options: [
              { label: "Todos", value: "all" },
              { label: "Activo", value: "ACTIVO" },
              { label: "Por vencer", value: "POR_VENCER" },
              { label: "Vencido", value: "VENCIDO" },
              { label: "Borrador", value: "BORRADOR" },
            ],
          },
        ]}
        emptyTitle="No se encontraron contratos"
        emptyMessage="Prueba cambiando los filtros o el texto de busqueda."
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        onDetail={(contract) => console.log("Ver contrato", contract)}
        onEdit={(contract) => console.log("Editar contrato", contract)}
        renderMobileCard={(row) => <ContratoMobileCard contract={row.original} />}
      />
    </section>
  )
}
