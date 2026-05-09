import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { useGetUsuarioByIdQuery } from "../store"

type UsuarioDetalleDialogProps = {
  open: boolean
  userId: string | null
  onOpenChange: (open: boolean) => void
}

const getRolLabel = (rol?: string) => {
  if (rol === "ROLE_ADMIN") return "Administrador"
  if (rol === "ROLE_USER") return "Usuario"
  return rol || "Sin rol"
}

const getTipoPerfilLabel = (tipoPerfil?: string) => {
  if (tipoPerfil === "PERSONAL") return "Personal"
  if (tipoPerfil === "EMPRESA") return "Empresa"
  return tipoPerfil || "Sin tipo"
}

const getNombreCompleto = (nombre?: string | null, apellido?: string | null) => {
  const partes = [nombre?.trim(), apellido?.trim()].filter(Boolean)
  return partes.length > 0 ? partes.join(" ") : "Usuario sin nombre"
}

const getInitials = (nombreCompleto: string, correo?: string | null) => {
  const parts = nombreCompleto.split(" ").filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return correo?.[0]?.toUpperCase() ?? "U"
}

const asText = (value?: string | null) => {
  const normalized = value?.trim()
  return normalized ? normalized : "No registrado"
}

const normalizeImageUrl = (value?: string | null) => {
  const url = value?.trim()
  return url && url.length > 0 ? url : null
}

const formatDate = (value?: string | null) => {
  if (!value) return "No registrado"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Fecha invalida"

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export const UsuarioDetalleDialog = ({
  open,
  userId,
  onOpenChange,
}: UsuarioDetalleDialogProps) => {
  const { data, isLoading, isError } = useGetUsuarioByIdQuery(userId ?? "", {
    skip: !open || !userId,
  })

  const fullName = getNombreCompleto(data?.nombre, data?.apellido)
  const initials = getInitials(fullName, data?.correo)
  const fotoUrl = normalizeImageUrl(data?.fotoUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de usuario</DialogTitle>
          <DialogDescription>
            Informacion general, perfil y actividad del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-rose-600">No se pudo cargar el detalle del usuario.</p>
        ) : null}

        {data ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                {fotoUrl ? (
                  <AvatarImage src={fotoUrl} alt={fullName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-slate-100 text-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{fullName}</h3>
                <p className="break-words text-sm text-slate-500">{asText(data.correo)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{getRolLabel(data.rol)}</Badge>
                  <Badge variant="secondary">{getTipoPerfilLabel(data.tipoPerfil)}</Badge>
                  <Badge className={data.estado ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                    {data.estado ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge className={data.estadoConexion ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-700"}>
                    {data.estadoConexion ? "En linea" : "Desconectado"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <Card className="space-y-3 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Perfil</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Nombre</p>
                  <p className="text-sm font-medium text-slate-800">{asText(data.nombre)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Apellido</p>
                  <p className="text-sm font-medium text-slate-800">{asText(data.apellido)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Telefono</p>
                  <p className="text-sm font-medium text-slate-800">{asText(data.telefono)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tipo de perfil</p>
                  <p className="text-sm font-medium text-slate-800">{getTipoPerfilLabel(data.tipoPerfil)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Descripcion</p>
                <p className="mt-1 rounded-md border bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 break-words">
                  {asText(data.descripcion) === "No registrado"
                    ? "No se registro una descripcion para este usuario."
                    : asText(data.descripcion)}
                </p>
              </div>
            </Card>

            <Card className="space-y-3 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Actividad</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Total publicaciones</p>
                  <p className="text-sm font-medium text-slate-800">{data.totalPublicaciones}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha creacion</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(data.createdDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ultima modificacion</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(data.lastModifiedDate)}</p>
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
