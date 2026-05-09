import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { useGetUsuarioByIdQuery } from "../store"

type UsuarioDetalleDialogProps = {
  open: boolean
  userId: string | null
  onOpenChange: (open: boolean) => void
}

export const UsuarioDetalleDialog = ({
  open,
  userId,
  onOpenChange,
}: UsuarioDetalleDialogProps) => {
  const { data, isLoading, isError } = useGetUsuarioByIdQuery(userId ?? "", {
    skip: !open || !userId,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de usuario</DialogTitle>
          <DialogDescription>
            Informacion del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-44" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-rose-600">No se pudo cargar el detalle del usuario.</p>
        ) : null}

        {data ? (
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Correo:</span> {data.correo}</p>
            <p><span className="font-semibold">Rol:</span> {data.rol}</p>
            <p><span className="font-semibold">Tipo perfil:</span> {data.tipoPerfil}</p>
            <p><span className="font-semibold">Nombre:</span> {data.nombre}</p>
            <p><span className="font-semibold">Apellido:</span> {data.apellido ?? "-"}</p>
            <p><span className="font-semibold">Telefono:</span> {data.telefono ?? "-"}</p>
            <p><span className="font-semibold">Descripcion:</span> {data.descripcion ?? "-"}</p>
            <p><span className="font-semibold">Estado:</span> {data.estado ? "Activo" : "Inactivo"}</p>
            <p><span className="font-semibold">Conexion:</span> {data.estadoConexion ? "Conectado" : "Desconectado"}</p>
            <p><span className="font-semibold">Total publicaciones:</span> {data.totalPublicaciones}</p>
            <p><span className="font-semibold">Fecha creacion:</span> {data.createdDate ?? "-"}</p>
            <p><span className="font-semibold">Ultima modificacion:</span> {data.lastModifiedDate ?? "-"}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
