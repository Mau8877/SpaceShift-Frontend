import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  useActivarUsuarioMutation,
  useDesactivarUsuarioMutation,
  useGetUsuariosQuery,
} from "../store"
import type { UsuarioListItem } from "../types"
import type { DataTableRowAction } from "@/components/DataTable"
import { DataTable } from "@/components/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function GestionarUsuariosScreen() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [estadoConexionFilter, setEstadoConexionFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<UsuarioListItem | null>(null)
  const [dialogMode, setDialogMode] = useState<"detail" | "edit">("detail")

  const estado =
    estadoFilter === "all" ? null : estadoFilter === "true" ? true : false
  const estadoConexion =
    estadoConexionFilter === "all"
      ? null
      : estadoConexionFilter === "true"
        ? true
        : false

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsuariosQuery({
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

  const stats = data?.stats ?? {
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosInactivos: 0,
    totalPublicaciones: 0,
  }

  const rows = data?.content ?? []

  const handleEstadoFilterChange = (value: string) => {
    setEstadoFilter(value)
    setPage(0)
  }

  const handleEstadoConexionFilterChange = (value: string) => {
    setEstadoConexionFilter(value)
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const handleToggleEstado = async (usuario: UsuarioListItem) => {
    if (usuario.estado) {
      const confirmed = window.confirm(
        `Deseas desactivar al usuario ${usuario.nombre} ${usuario.apellido ?? ""}?`
      )
      if (!confirmed) return

      try {
        await desactivarUsuario(usuario.id).unwrap()
        toast.success("Usuario desactivado correctamente")
      } catch (error: any) {
        toast.error("No se pudo desactivar el usuario", {
          description: error?.data?.message ?? "Intenta nuevamente.",
        })
      }
      return
    }

    try {
      await activarUsuario(usuario.id).unwrap()
      toast.success("Usuario activado correctamente")
    } catch (error: any) {
      toast.error("No se pudo activar el usuario", {
        description: error?.data?.message ?? "Intenta nuevamente.",
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
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900">
            {row.original.correo}
          </span>
        ),
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
        cell: ({ row }) =>
          row.original.estado ? (
            <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
          ) : (
            <Badge className="bg-rose-100 text-rose-800">Inactivo</Badge>
          ),
      },
      {
        accessorKey: "estadoConexion",
        header: "Conexion",
        cell: ({ row }) =>
          row.original.estadoConexion ? (
            <Badge className="bg-cyan-100 text-cyan-800">Conectado</Badge>
          ) : (
            <Badge className="bg-slate-100 text-slate-700">Desconectado</Badge>
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
        onClick: (row) => {
          setDialogMode("detail")
          setSelectedUser(row)
        },
      },
      {
        id: "edit",
        label: "Editar",
        onClick: (row) => {
          setDialogMode("edit")
          setSelectedUser(row)
        },
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

  if (isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950">Gestion de Usuarios</h2>
        <Card className="border-slate-200 p-6">
          <p className="text-sm text-slate-600">
            No se pudo cargar la lista de usuarios.
          </p>
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
          Administra usuarios, roles y estado de actividad.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total usuarios</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{stats.totalUsuarios}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Usuarios activos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {stats.usuariosActivos}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Usuarios inactivos</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {stats.usuariosInactivos}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total publicaciones</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {stats.totalPublicaciones}
          </p>
        </article>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading || isFetching}
        search={{
          enabled: true,
          placeholder: "Buscar por nombre, correo o telefono...",
          value: search,
          onChange: handleSearchChange,
        }}
        filters={[
          {
            id: "estado",
            label: "Estado",
            value: estadoFilter,
            onChange: handleEstadoFilterChange,
            options: [
              { label: "Todos", value: "all" },
              { label: "Activos", value: "true" },
              { label: "Inactivos", value: "false" },
            ],
          },
          {
            id: "estadoConexion",
            label: "Conexion",
            value: estadoConexionFilter,
            onChange: handleEstadoConexionFilterChange,
            options: [
              { label: "Todos", value: "all" },
              { label: "Conectados", value: "true" },
              { label: "Desconectados", value: "false" },
            ],
          },
        ]}
        manualPagination
        pageIndex={data?.page ?? page}
        pageSize={data?.size ?? size}
        pageCount={Math.max(data?.totalPages ?? 1, 1)}
        totalRecords={data?.totalElements ?? 0}
        pageSizeOptions={[5, 10, 15]}
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setSize(nextSize)
          setPage(0)
        }}
        actions={actions}
        emptyTitle="No se encontraron usuarios"
        emptyMessage="Prueba cambiando los filtros o el texto de busqueda."
        onRefresh={refetch}
      />

      <Dialog open={Boolean(selectedUser)} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "detail" ? "Detalle de usuario" : "Editar usuario"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "detail"
                ? "Vista rapida del usuario seleccionado."
                : "Edicion de usuario pendiente de implementar en la siguiente iteracion."}
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Nombre:</span> {selectedUser.nombre}{" "}
                {selectedUser.apellido ?? ""}
              </p>
              <p>
                <span className="font-semibold">Correo:</span> {selectedUser.correo}
              </p>
              <p>
                <span className="font-semibold">Telefono:</span>{" "}
                {selectedUser.telefono || "-"}
              </p>
              <p>
                <span className="font-semibold">Rol:</span> {selectedUser.rol}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
