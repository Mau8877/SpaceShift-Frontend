import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UsuarioFiltersProps = {
  search: string
  estado: string
  estadoConexion: string
  onSearchChange: (value: string) => void
  onEstadoChange: (value: string) => void
  onEstadoConexionChange: (value: string) => void
}

export const UsuarioFilters = ({
  search,
  estado,
  estadoConexion,
  onSearchChange,
  onEstadoChange,
  onEstadoConexionChange,
}: UsuarioFiltersProps) => {
  return (
    <div className="flex w-full flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1 md:max-w-sm">
        <Label className="mb-1.5 block text-xs text-slate-600">Buscar</Label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre o correo"
        />
      </div>

      <div className="w-full min-w-[150px] sm:w-[170px]">
        <Label className="mb-1.5 block text-xs text-slate-600">Estado</Label>
        <Select value={estado} onValueChange={onEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full min-w-[170px] sm:w-[190px]">
        <Label className="mb-1.5 block text-xs text-slate-600">Conexion</Label>
        <Select value={estadoConexion} onValueChange={onEstadoConexionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Conexion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Conectados</SelectItem>
            <SelectItem value="false">Desconectados</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  )
}
