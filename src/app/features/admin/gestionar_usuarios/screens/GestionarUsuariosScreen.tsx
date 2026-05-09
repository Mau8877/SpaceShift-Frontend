import type { ColumnDef } from "@tanstack/react-table"
import {
  PencilEdit01Icon,
  RefreshIcon,
  UserAdd01Icon,
  ViewIcon,
} from "hugeicons-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useAppSelector } from "@/app/store"
import type { DataTableRowAction } from "@/components/DataTable"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import {
  UsuarioDetalleDialog,
  UsuarioEstadoBadge,
  UsuarioFilters,
  UsuarioFormDialog,
  UsuarioStatsCards,
} from "../components"
import {
  useActivarUsuarioMutation,
  useDesactivarUsuarioMutation,
  useGetUsuariosQuery,
} from "../store"
import type { UsuarioListItem } from "../types"

const EMPTY_STATS = {
  totalUsuarios: 0,
  usuariosActivos: 0,
  usuariosInactivos: 0,
  totalPublicaciones: 0,
}

export function GestionarUsuariosScreen() {
  const currentUser = useAppSelector((state) => state.auth.user)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [estadoConexionFilter, setEstadoConexionFilter] = useState<string>("all")

  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [selectedEditUser, setSelectedEditUser] = useState<UsuarioListItem | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const estado =
    estadoFilter === "all" ? null : estadoFilter === "true" ? true : false

  const estadoConexion =
    estadoConexionFilter === "all"
      ? null
      : estadoConexionFilter === "true"
        ? true
        : false

  const { data, isLoading, isFetching, isError, error, refetch } = useGetUsuariosQuery({
    page,
    size,
    search,
    estado,
    estadoConexion,
  })

  const [activarUsuario, { isLoading: isActivando }] = useActivarUsuarioMutation()
  const [desactivarUsuario, { isLoading: isDesactivando }] =
    useDesactivarUsuarioMutation()

  const isMutating = isActivando || isDesactivando

  const stats = data?.stats ?? EMPTY_STATS
  const rows = data?.content ?? []

  const isForbidden =
    (error as any)?.status === 403 || (error as any)?.originalStatus === 403

  const handleOpenCreate = () => {
    setFormMode("create")
    setSelectedEditUser(null)
    setIsFormDialogOpen(true)
  }

  const handleOpenEdit = (row: UsuarioListItem) => {
    setFormMode("edit")
    setSelectedEditUser(row)
    setIsFormDialogOpen(true)
  }

  const handleToggleEstado = async (usuario: UsuarioListItem) => {
    if (usuario.estado) {
      const confirmed = window.confirm("¿Seguro que deseas desactivar este usuario?")
      if (!confirmed) {
        return
      }

      try {
        await desactivarUsuario(usuario.id).unwrap()
        toast.success("Usuario desactivado correctamente")
      } catch (mutationError: any) {
        toast.error("No se pudo desactivar el usuario", {
          description: mutationError?.data?.message ?? "Intenta nuevamente.",
        })
      }
      return
    }

    try {
      await activarUsuario(usuario.id).unwrap()
      toast.success("Usuario activado correctamente")
    } catch (mutationError: any) {
      toast.error("No se pudo activar el usuario", {
        description: mutationError?.data?.message ?? "Intenta nuevamente.",
      })
    }
  }

  const columns = useMemo<Array<ColumnDef<UsuarioListItem>>>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
          const id = row.original.id
          return (
            <span title={id} className="font-mono text-xs text-slate-700">
              {id.slice(0, 8)}...
            </span>
          )
        },
      },
      {
        accessorKey: "correo",
        header: "Correo",
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
      },
      {
        accessorKey: "apellido",
        header: "Apellido",
        cell: ({ row }) => row.original.apellido || "-",
      },
      {
        accessorKey: "telefono",
        header: "Telefono",
        cell: ({ row }) => row.original.telefono || "-",
      },
      {
        accessorKey: "rol",
        header: "Rol",
      },
      {
        accessorKey: "tipoPerfil",
        header: "Tipo perfil",
      },
      {
        accessorKey: "totalPublicaciones",
        header: "Total publicaciones",
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <UsuarioEstadoBadge tipo="estado" valor={row.original.estado} />
        ),
      },
      {
        accessorKey: "estadoConexion",
        header: "Estado conexion",
        cell: ({ row }) => (
          <UsuarioEstadoBadge tipo="conexion" valor={row.original.estadoConexion} />
        ),
      },
    ],
    []
  )

  const actions = useMemo<Array<DataTableRowAction<UsuarioListItem>>>(
    () => [
      {
        id: "detail",
        label: "Ver detalle",
        icon: ViewIcon,
        onClick: (row) => setSelectedDetailId(row.id),
      },
      {
        id: "edit",
        label: "Editar",
        icon: PencilEdit01Icon,
        onClick: handleOpenEdit,
      },
      {
        id: "deactivate",
        label: "Desactivar",
        variant: "destructive",
        hidden: (row) => !row.estado,
        disabled: () => isMutating,
        onClick: handleToggleEstado,
      },
      {
        id: "activate",
        label: "Activar",
        hidden: (row) => row.estado,
        disabled: () => isMutating,
        onClick: handleToggleEstado,
      },
    ],
    [isMutating]
  )

  if (currentUser?.rol !== "ROLE_ADMIN") {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950">Gestion de Usuarios</h2>
        <Card className="border-slate-200 p-6">
          <p className="text-sm text-slate-600">No tienes permisos para administrar usuarios.</p>
        </Card>
      </section>
    )
  }

  if (isForbidden) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950">Gestion de Usuarios</h2>
        <Card className="border-slate-200 p-6">
          <p className="text-sm text-slate-600">No tienes permisos para administrar usuarios.</p>
        </Card>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950">Gestion de Usuarios</h2>
        <Card className="border-slate-200 p-6">
          <p className="text-sm text-slate-600">No se pudo cargar la lista de usuarios.</p>
          <Button className="mt-4" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Gestion de Usuarios</h2>
        <p className="mt-1 text-sm text-slate-500">
          Administra usuarios, perfiles y estado de cuentas del sistema.
        </p>
      </div>

      <UsuarioStatsCards stats={stats} />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading || isFetching}
        toolbarContent={
          <UsuarioFilters
            search={searchInput}
            estado={estadoFilter}
            estadoConexion={estadoConexionFilter}
            onSearchChange={(value) => {
              setSearchInput(value)
              setPage(0)
            }}
            onEstadoChange={(value) => {
              setEstadoFilter(value)
              setPage(0)
            }}
            onEstadoConexionChange={(value) => {
              setEstadoConexionFilter(value)
              setPage(0)
            }}
          />
        }
        rightActions={
          <>
            <Button type="button" onClick={handleOpenCreate}>
              <UserAdd01Icon size={18} />
              Crear usuario
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Actualizar tabla"
              aria-label="Actualizar tabla"
              onClick={() => refetch()}
            >
              <RefreshIcon size={18} className={isFetching ? "animate-spin" : ""} />
            </Button>
          </>
        }
        manualPagination
        pageIndex={data?.page ?? page}
        pageSize={data?.size ?? size}
        pageCount={Math.max(data?.totalPages ?? 1, 1)}
        totalRecords={data?.totalElements ?? 0}
        pageSizeOptions={[5, 10, 15]}
        showPaginationSizeSelector
        onPageChange={setPage}
        onPageSizeChange={setSize}
        actions={actions}
        emptyTitle="No se encontraron usuarios"
        emptyMessage="Prueba cambiando los filtros o los criterios de busqueda."
      />

      <UsuarioDetalleDialog
        open={Boolean(selectedDetailId)}
        userId={selectedDetailId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDetailId(null)
          }
        }}
      />

      <UsuarioFormDialog
        open={isFormDialogOpen}
        mode={formMode}
        user={selectedEditUser}
        onOpenChange={setIsFormDialogOpen}
      />
    </section>
  )
}
