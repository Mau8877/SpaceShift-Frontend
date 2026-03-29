import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Search01Icon,
  MapsLocation01Icon,
  House01Icon,
  DollarCircleIcon,
} from "hugeicons-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function HomeSearchBar() {
  const { t } = useTranslation()
  const [location, setLocation] = useState("")

  return (
    <div className="mx-auto -mt-[1px] w-full max-w-4xl px-4 relative z-20">
      <div className="flex h-16 items-stretch gap-1 border border-slate-200 bg-white p-1 shadow-xl transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:h-20 sm:gap-2 sm:p-2 rounded-b-[32px] rounded-t-none">
        {/* Ubicación */}
        <div className="group flex min-w-0 flex-[1] flex-col justify-center rounded-full px-2 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 sm:px-8">
          <label className="ml-1 text-[10px] font-bold tracking-tighter text-slate-500 uppercase sm:text-xs">
            {t("home.search.location.label", "Ubicación")}
          </label>
          <div className="flex items-center gap-2">
            <MapsLocation01Icon
              size={18}
              className="text-primary transition-transform group-hover:scale-110"
            />
            <input
              type="text"
              placeholder={t("home.search.location.placeholder", "¿A dónde vas?")}
              className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-slate-400 sm:text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="my-auto h-8 w-[1px] bg-slate-100 dark:bg-slate-800" />

        {/* Tipo de Inmueble */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="group flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full px-2 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 sm:px-8">
              <label className="ml-1 text-[10px] font-bold tracking-tighter text-slate-500 uppercase sm:text-xs">
                {t("home.search.type.label", "Tipo")}
              </label>
              <div className="flex items-center gap-2">
                <House01Icon
                  size={18}
                  className="text-primary transition-transform group-hover:scale-110"
                />
                <span className="truncate text-xs font-medium text-slate-400 dark:text-slate-500 sm:text-sm">
                  {t("home.search.type.placeholder", "Cualquier tipo")}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 border-slate-200 p-2 shadow-2xl dark:border-slate-800">
            <div className="grid grid-cols-1 gap-1">
              {["Casa", "Departamento", "Terreno", "Oficina"].map((tipo) => (
                <Button
                  key={tipo}
                  variant="ghost"
                  className="justify-start text-xs sm:text-sm"
                >
                  {tipo}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="my-auto h-8 w-[1px] bg-slate-100 dark:bg-slate-800" />

        {/* Rango de Precio */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="group flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full px-2 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 sm:px-8">
              <label className="ml-1 text-[10px] font-bold tracking-tighter text-slate-500 uppercase sm:text-xs">
                {t("home.search.price.label", "Precio")}
              </label>
              <div className="flex items-center gap-2">
                <DollarCircleIcon
                  size={18}
                  className="text-primary transition-transform group-hover:scale-110"
                />
                <span className="truncate text-xs font-medium text-slate-400 dark:text-slate-500 sm:text-sm">
                  {t("home.search.price.placeholder", "Añadir presupuesto")}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-slate-200 p-4 shadow-2xl dark:border-slate-800">
            <h4 className="mb-2 text-sm font-bold">Rango de precio</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border p-2">
                <span className="block text-[10px] text-slate-400">Mínimo</span>
                <span className="text-sm font-medium">$0</span>
              </div>
              <div className="flex-1 rounded-md border p-2">
                <span className="block text-[10px] text-slate-400">Máximo</span>
                <span className="text-sm font-medium">Cualquiera</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Botón Buscar */}
        <div className="flex items-center px-1 sm:px-2">
          <Button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary p-0 shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 sm:h-14 sm:w-auto sm:px-6 sm:gap-2"
          >
            <Search01Icon
              size={20}
              strokeWidth={2.5}
              className="text-white sm:size-6"
            />
            <span className="hidden font-bold text-white sm:inline-block">
              {t("home.search.button", "Buscar")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
