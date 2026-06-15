import * as React from "react"
import type { ColumnDef, Row } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { DataTable } from "@/components/DataTable"
import { toast } from "sonner"
import {
  useGetContratosComoPropietarioQuery,
  useGetContratosComoClienteQuery,
  useEliminarContratoMutation,
  useCancelarContratoMutation,
} from "../store"
import type {
  ContractStatus,
  ContractType,
  ContratoResponseDTO,
} from "../types/mis-contratos.types"
import { Button } from "@/components/ui/button"
import { ViewIcon } from "hugeicons-react"


const contractTypeLabels: Record<ContractType, string> = {
  ALQUILER: "Alquiler",
  VENTA: "Venta",
  ANTICRETICO: "Anticretico",
  ALOJAMIENTO: "Alojamiento",
}

const contractStatusLabels: Record<ContractStatus, string> = {
  BORRADOR: "Borrador",
  PENDIENTE_FIRMA: "Pendiente de firma",
  VIGENTE: "Activo",
  FINALIZADO: "Concluido",
  CANCELADO: "Cancelado",
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

  return "bg-orange-50 text-orange-700 ring-orange-200" // ALOJAMIENTO
}

const getContractStatusClassName = (status: ContractStatus) => {
  if (status === "VIGENTE") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }

  if (status === "PENDIENTE_FIRMA") {
    return "bg-amber-50 text-amber-700 ring-amber-200"
  }

  if (status === "FINALIZADO") {
    return "bg-slate-50 text-slate-600 ring-slate-200"
  }

  if (status === "CANCELADO") {
    return "bg-rose-50 text-rose-700 ring-rose-200"
  }

  return "bg-slate-50 text-slate-500 ring-slate-200" // BORRADOR
}

const formatAmount = (moneda: string, amount?: number) => {
  const safeAmount = amount ?? 0
  return `${moneda} ${safeAmount.toLocaleString("es-BO")}`
}

const equalsFilter = (
  row: Row<ContratoResponseDTO>,
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

const ContratoMobileCard = ({
  contract,
  activeRole,
}: {
  contract: ContratoResponseDTO
  activeRole: "PROPIETARIO" | "CLIENTE"
}) => {
  const [eliminar] = useEliminarContratoMutation()
  const [cancelar] = useCancelarContratoMutation()

  const handleEliminar = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`¿Estás seguro de eliminar el contrato ${contract.codigo}?`)) {
      try {
        await eliminar(contract.id).unwrap()
        toast.success("Contrato eliminado correctamente")
      } catch (err: any) {
        toast.error(err?.data?.message || "Error al eliminar el contrato")
      }
    }
  }

  const handleCancelar = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`¿Estás seguro de cancelar el contrato vigente ${contract.codigo}?`)) {
      try {
        await cancelar(contract.id).unwrap()
        toast.success("Contrato cancelado correctamente")
      } catch (err: any) {
        toast.error(err?.data?.message || "Error al cancelar el contrato")
      }
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{contract.codigo}</p>
          <p className="mt-1 text-sm text-slate-500">
            {activeRole === "PROPIETARIO"
              ? `Cliente: ${contract.clienteNombre}`
              : `Propietario: ${contract.propietarioNombre}`}
          </p>
        </div>

        <ContractStatusBadge status={contract.estadoContrato} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ContractTypeBadge type={contract.tipoContrato} />
        {contract.renovacionAutomatica ? (
          <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200">
            Renovación auto
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Inmueble</p>
          <p className="text-sm font-semibold text-slate-800">
            {contract.inmuebleTitulo}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500">Inicio</p>
            <p className="text-sm font-semibold text-slate-800">
              {contract.fechaInicio}
            </p>
          </div>
          {contract.fechaFin && (
            <div>
              <p className="text-xs font-medium text-slate-500">Fin</p>
              <p className="text-sm font-semibold text-slate-800">
                {contract.fechaFin}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">Monto</p>
          <p className="text-sm font-semibold text-slate-800">
            {formatAmount(contract.moneda, contract.monto)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <Link
          to="/dashboard/contratos/$id"
          params={{ id: contract.id }}
          className="text-slate-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-xl transition-colors"
          title="Visualizar Contrato"
        >
          <ViewIcon className="h-5 w-5" />
        </Link>
        {activeRole === "PROPIETARIO" && contract.estadoContrato === "PENDIENTE_FIRMA" && (
          <button
            onClick={handleEliminar}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            Eliminar
          </button>
        )}
        {activeRole === "PROPIETARIO" && contract.estadoContrato === "VIGENTE" && (
          <button
            onClick={handleCancelar}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </article>
  )
}

export const MisContratosScreen = () => {
  const navigate = useNavigate()
  const [activeRole, setActiveRole] = useState<"PROPIETARIO" | "CLIENTE">(
    "PROPIETARIO"
  )


  const {
    data: contratosOwner = [],
    isLoading: isLoadingOwner,
    refetch: refetchOwner,
  } = useGetContratosComoPropietarioQuery()
  const {
    data: contratosClient = [],
    isLoading: isLoadingClient,
    refetch: refetchClient,
  } = useGetContratosComoClienteQuery()

  const listData = activeRole === "PROPIETARIO" ? contratosOwner : contratosClient
  const isLoading = activeRole === "PROPIETARIO" ? isLoadingOwner : isLoadingClient

  React.useEffect(() => {
    if (activeRole === "PROPIETARIO") {
      refetchOwner()
    } else {
      refetchClient()
    }
  }, [activeRole, refetchOwner, refetchClient])

  const summary = useMemo(() => {
    return {
      total: listData.length,
      activos: listData.filter((c) => c.estadoContrato === "VIGENTE").length,
      pendientes: listData.filter((c) => c.estadoContrato === "PENDIENTE_FIRMA")
        .length,
      concluidos: listData.filter(
        (c) => c.estadoContrato === "FINALIZADO" || c.estadoContrato === "CANCELADO"
      ).length,
    }
  }, [listData])

  const columns = useMemo<Array<ColumnDef<ContratoResponseDTO>>>(
    () => [
      {
        id: "codigo",
        accessorFn: (row) =>
          `${row.codigo} ${row.clienteNombre} ${row.propietarioNombre} ${row.inmuebleTitulo}`,
        header: "Contrato",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-950">{row.original.codigo}</p>
            <p className="mt-1 text-xs text-slate-500">
              {activeRole === "PROPIETARIO"
                ? `Cliente: ${row.original.clienteNombre}`
                : `Propietario: ${row.original.propietarioNombre}`}
            </p>
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
        accessorKey: "inmuebleTitulo",
        header: "Inmueble",
        cell: ({ row }) => (
          <div className="max-w-[240px]">
            <p className="line-clamp-2 font-medium text-slate-800">
              {row.original.inmuebleTitulo}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "estadoContrato",
        header: "Estado",
        filterFn: equalsFilter,
        cell: ({ row }) => (
          <ContractStatusBadge status={row.original.estadoContrato} />
        ),
      },
      {
        id: "vigencia",
        accessorFn: (row) => `${row.fechaInicio} ${row.fechaFin || ""}`,
        header: "Vigencia",
        cell: ({ row }) => (
          <div>
            <p className="text-xs text-slate-500">Inicio: {row.original.fechaInicio}</p>
            {row.original.fechaFin && (
              <p className="text-xs text-slate-500">Fin: {row.original.fechaFin}</p>
            )}
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
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const contract = row.original
          const [eliminar] = useEliminarContratoMutation()
          const [cancelar] = useCancelarContratoMutation()

          const handleEliminar = (e: React.MouseEvent) => {
            e.stopPropagation()
            if (window.confirm(`¿Estás seguro de eliminar el contrato ${contract.codigo}?`)) {
              eliminar(contract.id)
                .unwrap()
                .then(() => toast.success("Contrato eliminado correctamente"))
                .catch((err: any) => toast.error(err?.data?.message || "Error al eliminar el contrato"))
            }
          }

          const handleCancelar = (e: React.MouseEvent) => {
            e.stopPropagation()
            if (window.confirm(`¿Estás seguro de cancelar el contrato vigente ${contract.codigo}?`)) {
              cancelar(contract.id)
                .unwrap()
                .then(() => toast.success("Contrato cancelado correctamente"))
                .catch((err: any) => toast.error(err?.data?.message || "Error al cancelar el contrato"))
            }
          }

          return (
            <div className="flex items-center gap-2 justify-center">
              <Link
                to="/dashboard/contratos/$id"
                params={{ id: contract.id }}
                className="text-slate-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-xl transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Visualizar Contrato"
              >
                <ViewIcon className="h-5 w-5" />
              </Link>
              {activeRole === "PROPIETARIO" && contract.estadoContrato === "PENDIENTE_FIRMA" && (
                <button
                  onClick={handleEliminar}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Eliminar
                </button>
              )}
              {activeRole === "PROPIETARIO" && contract.estadoContrato === "VIGENTE" && (
                <button
                  onClick={handleCancelar}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          )
        },
      },
    ],
    [activeRole]
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 font-heading">
            Contratos registrados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Revisa los contratos asociados a tus inmuebles y su estado actual.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {activeRole === "PROPIETARIO" && (
            <Link to="/dashboard/proponer-contrato">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95"
              >
                + Proponer Contrato
              </Button>
            </Link>
          )}

          {/* Selector de Rol */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <Button
              variant={activeRole === "PROPIETARIO" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveRole("PROPIETARIO")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                activeRole === "PROPIETARIO"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 hover:bg-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Como Propietario
            </Button>
            <Button
              variant={activeRole === "CLIENTE" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveRole("CLIENTE")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                activeRole === "CLIENTE"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 hover:bg-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Como Cliente
            </Button>
          </div>
        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total contratos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{summary.total}</p>
          <p className="mt-2 text-sm text-slate-500">Asociados a tu cuenta</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Activos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{summary.activos}</p>
          <p className="mt-2 text-sm text-slate-500">Contratos vigentes hoy</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pendientes de Firma</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.pendientes}
          </p>
          <p className="mt-2 text-sm text-slate-500">Requieren firma del cliente</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Concluidos / Cancelados</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {summary.concluidos}
          </p>
          <p className="mt-2 text-sm text-slate-500">Contratos finalizados</p>
        </article>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-900 border-t-transparent"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={listData}
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
                { label: "Alojamiento", value: "ALOJAMIENTO" },
              ],
            },
            {
              id: "estadoContrato",
              label: "Estado",
              columnId: "estadoContrato",
              options: [
                { label: "Todos", value: "all" },
                { label: "Borrador", value: "BORRADOR" },
                { label: "Pendiente Firma", value: "PENDIENTE_FIRMA" },
                { label: "Activo", value: "VIGENTE" },
                { label: "Concluido", value: "FINALIZADO" },
                { label: "Cancelado", value: "CANCELADO" },
              ],
            },
          ]}
          emptyTitle="No se encontraron contratos"
          emptyMessage="Prueba cambiando los filtros o el texto de búsqueda."
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          renderMobileCard={(row) => (
            <ContratoMobileCard
              contract={row.original}
              activeRole={activeRole}
            />
          )}
        />
      )}
    </section>
  )
}
