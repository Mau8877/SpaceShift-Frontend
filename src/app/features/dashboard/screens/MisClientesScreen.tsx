import type { ColumnDef, Row } from "@tanstack/react-table"
import { useMemo } from "react"

import { DataTable } from "@/components/DataTable"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetClientesComoPropietarioQuery } from "../store/contratoApi"
import type { ClientStatus, ClientType, DashboardClient } from "../types"

const clientTypeLabels: Record<ClientType, string> = {
  INQUILINO: "Inquilino",
  COMPRADOR: "Comprador",
  HUESPED: "Huésped",
  ANTICRESISTA: "Anticresista",
}

const clientStatusLabels: Record<ClientStatus, string> = {
  ACTIVO: "Activo",
  HISTORICO: "Histórico",
  PENDIENTE: "Pendiente",
}

const getClientTypeClassName = (type: ClientType) => {
  if (type === "INQUILINO") {
    return "bg-blue-50 text-blue-700 ring-blue-200"
  }

  if (type === "COMPRADOR") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }

  if (type === "HUESPED") {
    return "bg-orange-50 text-orange-700 ring-orange-200"
  }

  return "bg-purple-50 text-purple-700 ring-purple-200"
}

const getClientStatusClassName = (status: ClientStatus) => {
  if (status === "ACTIVO") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }

  if (status === "PENDIENTE") {
    return "bg-amber-50 text-amber-700 ring-amber-200"
  }

  return "bg-slate-50 text-slate-600 ring-slate-200"
}

const formatAmount = (moneda: string, amount: number) => {
  return `${moneda} ${amount.toLocaleString("es-BO")}`
}

const equalsFilter = (
  row: Row<DashboardClient>,
  columnId: string,
  filterValue: unknown
) => {
  return row.getValue(columnId) === filterValue
}

const ClientTypeBadge = ({ type }: { type: ClientType }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getClientTypeClassName(
        type
      )}`}
    >
      {clientTypeLabels[type]}
    </span>
  )
}

const ClientStatusBadge = ({ status }: { status: ClientStatus }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getClientStatusClassName(
        status
      )}`}
    >
      {clientStatusLabels[status]}
    </span>
  )
}

const ClienteMobileCard = ({ client }: { client: DashboardClient }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{client.nombre}</p>
          <p className="mt-1 text-sm text-slate-500">{client.correo}</p>
          <p className="mt-1 text-sm text-slate-500">{client.telefono}</p>
        </div>

        <ClientStatusBadge status={client.estado} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ClientTypeBadge type={client.tipoCliente} />

        {client.contratoPorVencer ? (
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            Por vencer
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Inmueble</p>
          <p className="text-sm font-semibold text-slate-800">
            {client.inmueble}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Contrato</p>
          <p className="text-sm font-semibold text-slate-800">
            {client.contrato} · {client.tipoContrato}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Monto</p>
          <p className="text-sm font-semibold text-slate-800">
            {formatAmount(client.moneda, client.montoContrato)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-400">
        Última actividad: {client.ultimaActividad}
      </p>
    </article>
  )
}

export const MisClientesScreen = () => {
  const { data: clientes = [], isLoading } = useGetClientesComoPropietarioQuery()

  const summary = useMemo(() => {
    return {
      total: clientes.length,
      activos: clientes.filter((client) => client.estado === "ACTIVO")
        .length,
      historicos: clientes.filter(
        (client) => client.estado === "HISTORICO"
      ).length,
      porVencer: clientes.filter((client) => client.contratoPorVencer)
        .length,
    }
  }, [clientes])

  const columns = useMemo<Array<ColumnDef<DashboardClient>>>(
    () => [
      {
        id: "cliente",
        accessorFn: (row) => `${row.nombre} ${row.correo} ${row.telefono}`,
        header: "Cliente",
        cell: ({ row }) => {
          const client = row.original

          return (
            <div>
              <p className="font-semibold text-slate-950">{client.nombre}</p>
              <p className="mt-1 text-xs text-slate-500">{client.correo}</p>
              <p className="mt-1 text-xs text-slate-400">{client.telefono}</p>
            </div>
          )
        },
      },
      {
        accessorKey: "tipoCliente",
        header: "Tipo",
        filterFn: equalsFilter,
        cell: ({ row }) => <ClientTypeBadge type={row.original.tipoCliente} />,
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
        accessorKey: "contrato",
        header: "Contrato",
        cell: ({ row }) => {
          const client = row.original

          return (
            <div>
              <p className="font-semibold text-slate-800">{client.contrato}</p>
              <p className="mt-1 text-xs text-slate-500">
                {client.tipoContrato}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        filterFn: equalsFilter,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <ClientStatusBadge status={row.original.estado} />

            {row.original.contratoPorVencer ? (
              <span className="w-fit rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                Por vencer
              </span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "montoContrato",
        header: "Monto",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {formatAmount(row.original.moneda, row.original.montoContrato)}
          </span>
        ),
      },
      {
        accessorKey: "ultimaActividad",
        header: "Última actividad",
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">
            {row.original.ultimaActividad}
          </span>
        ),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Clientes vinculados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consulta clientes relacionados con tus inmuebles, contratos y
            reservas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <article
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
            <Skeleton className="h-10 w-72" />
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Clientes vinculados
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Consulta clientes relacionados con tus inmuebles, contratos y
          reservas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total clientes</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.total}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Registrados en tu cuenta
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Activos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.activos}
          </p>
          <p className="mt-2 text-sm text-slate-500">Con relación vigente</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Históricos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.historicos}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Con contratos finalizados
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Contratos por vencer
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.porVencer}
          </p>
          <p className="mt-2 text-sm text-slate-500">Requieren seguimiento</p>
        </article>
      </div>

      <DataTable
        columns={columns}
        data={clientes}
        search={{
          enabled: true,
          placeholder: "Buscar cliente, correo, teléfono o inmueble...",
        }}
        filters={[
          {
            id: "tipoCliente",
            label: "Tipo",
            columnId: "tipoCliente",
            options: [
              {
                label: "Todos",
                value: "all",
              },
              {
                label: "Inquilino",
                value: "INQUILINO",
              },
              {
                label: "Comprador",
                value: "COMPRADOR",
              },
              {
                label: "Huésped",
                value: "HUESPED",
              },
              {
                label: "Anticresista",
                value: "ANTICRESISTA",
              },
            ],
          },
          {
            id: "estado",
            label: "Estado",
            columnId: "estado",
            options: [
              {
                label: "Todos",
                value: "all",
              },
              {
                label: "Activo",
                value: "ACTIVO",
              },
              {
                label: "Histórico",
                value: "HISTORICO",
              },
              {
                label: "Pendiente",
                value: "PENDIENTE",
              },
            ],
          },
        ]}
        emptyTitle="No se encontraron clientes"
        emptyMessage="Prueba cambiando los filtros o el texto de búsqueda."
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        onDetail={(client) => console.log("Ver cliente", client)}
        onEdit={(client) => console.log("Editar cliente", client)}
        renderMobileCard={(row) => <ClienteMobileCard client={row.original} />}
      />
    </section>
  )
}
