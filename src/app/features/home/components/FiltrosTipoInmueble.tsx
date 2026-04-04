import { useTranslation } from "react-i18next"
import {
  Building03Icon,
  Calendar03Icon,
  Home01Icon,
  Key01Icon,
} from "hugeicons-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Props {
  value: string
  onFilterChange: (value: string) => void
}

export function FiltrosTipoInmueble({ value, onFilterChange }: Props) {
  const { t } = useTranslation()
  const categorias = [
    { id: "venta", label: t("home.filter.component.venta"), icon: Home01Icon },
    {
      id: "alquiler",
      label: t("home.filter.component.alquiler"),
      icon: Key01Icon,
    },
    {
      id: "anticretico",
      label: t("home.filter.component.anticretico"),
      icon: Building03Icon,
    },
    {
      id: "alojamiento",
      label: t("home.filter.component.alojamiento"),
      icon: Calendar03Icon,
    },
  ]

  return (
    <div className="flex w-full justify-center pt-6 pb-0 dark:bg-transparent">
      <Tabs value={value} className="w-full max-w-4xl px-4">
        <TabsList className="grid !h-16 w-full grid-cols-4 items-stretch overflow-hidden border border-slate-200 !bg-slate-100/50 p-0 shadow-sm rounded-t-[32px] rounded-b-none border-b-0 dark:!bg-transparent">
          {categorias.map((cat, index) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              // ✅ El truco está aquí: Capturamos el clic antes de que Radix lo procese
              onClick={() => {
                if (value === cat.id) {
                  onFilterChange("") // Si ya está seleccionado, lo limpiamos
                } else {
                  onFilterChange(cat.id) // Si no, seleccionamos el nuevo
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
