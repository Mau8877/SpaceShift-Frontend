import {
  Building03Icon,
  Calendar03Icon,
  Home01Icon,
  Key01Icon,
} from "hugeicons-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetTiposTransaccionQuery } from "../store/homeApi"

interface Props {
  value: string
  onFilterChange: (value: string) => void
}

export function FiltrosTipoInmueble({ value, onFilterChange }: Props) {
  const { data: tiposTransaccion = [] } = useGetTiposTransaccionQuery()

  // Mapeo dinámico de iconos y labels basados en lo que venga del backend
  const mapping: Record<string, { label: string; icon: any }> = {
    VENTA: { label: "Venta", icon: Home01Icon },
    ALQUILER: { label: "Alquiler", icon: Key01Icon },
    ANTICRETICO: { label: "Anticrético", icon: Building03Icon },
    ALOJAMIENTO: { label: "Alojamiento", icon: Calendar03Icon },
  }

  // Si el backend trae algo que no está en el mapping, usamos valores por defecto
  const categorias = tiposTransaccion.map(tipo => ({
    id: tipo,
    label: mapping[tipo]?.label || tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase(),
    icon: mapping[tipo]?.icon || Home01Icon
  }))

  if (categorias.length === 0) return null

  return (
    <div className="flex w-full justify-center pt-6 pb-0 dark:bg-transparent">
      <Tabs value={value} className="w-full max-w-4xl px-4">
        <TabsList className={`grid !h-16 w-full items-stretch overflow-hidden border border-slate-200 !bg-slate-100/50 p-0 shadow-sm rounded-t-[32px] rounded-b-none border-b-0 dark:!bg-transparent`} style={{ gridTemplateColumns: `repeat(${categorias.length}, minmax(0, 1fr))` }}>
          {categorias.map((cat, index) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              onClick={() => {
                if (value === cat.id) {
                  onFilterChange("")
                } else {
                  onFilterChange(cat.id)
                }
              }}
              className={`group relative flex !h-full flex-row items-center justify-center gap-1.5 rounded-none !border-none !bg-transparent p-0 !shadow-none transition-all text-slate-500 after:hidden sm:gap-3 data-[state=active]:!bg-primary data-[state=active]:!text-white ${index !== categorias.length - 1 ? "border-r border-slate-200/60" : ""} `}
            >
              <cat.icon className="!size-5 transition-transform group-hover:scale-110 sm:!size-6" />
              <span className="text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                {cat.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
