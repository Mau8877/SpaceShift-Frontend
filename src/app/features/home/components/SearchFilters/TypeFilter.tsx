import { House01Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchField } from "./SearchField"
import { useGetTiposInmuebleQuery } from "../../store/homeApi"

interface TypeFilterProps {
  selectedType: string | null
  onSelect: (val: string | null) => void
}

export const TypeFilter = ({
  selectedType,
  onSelect,
}: TypeFilterProps) => {
  const { data: tipos = [] } = useGetTiposInmuebleQuery()

  // Helper para formatear texto (ej: CASA -> Casa)
  const formatType = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace("_", " ")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-1">
          <SearchField
            label="Tipo"
            icon={<House01Icon size={18} />}
            className="w-full"
          >
            <span className={`truncate text-xs font-medium sm:text-sm ${selectedType ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
              {selectedType ? formatType(selectedType) : "Cualquier tipo"}
            </span>
          </SearchField>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 border-slate-200 p-2 shadow-2xl dark:border-slate-800">
        <div className="grid grid-cols-1 gap-1">
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <Button
                key={tipo}
                variant={selectedType === tipo ? "secondary" : "ghost"}
                className={`justify-start text-xs sm:text-sm ${selectedType === tipo ? "bg-slate-100 font-bold text-primary dark:bg-slate-800" : ""}`}
                onClick={() => onSelect(tipo === selectedType ? null : tipo)}
              >
                {formatType(tipo)}
              </Button>
            ))
          ) : (
            <p className="p-4 text-center text-xs text-slate-400">Cargando tipos...</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
