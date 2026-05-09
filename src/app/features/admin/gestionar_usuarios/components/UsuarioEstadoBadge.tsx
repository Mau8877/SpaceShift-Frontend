import { Badge } from "@/components/ui/badge"

type UsuarioEstadoBadgeProps = {
  tipo: "estado" | "conexion"
  valor: boolean
}

export const UsuarioEstadoBadge = ({ tipo, valor }: UsuarioEstadoBadgeProps) => {
  if (tipo === "estado") {
    return valor ? (
      <Badge className="bg-emerald-100 text-emerald-800">Activo</Badge>
    ) : (
      <Badge className="bg-rose-100 text-rose-800">Inactivo</Badge>
    )
  }

  return valor ? (
    <Badge className="bg-cyan-100 text-cyan-800">Conectado</Badge>
  ) : (
    <Badge className="bg-slate-100 text-slate-700">Desconectado</Badge>
  )
}
