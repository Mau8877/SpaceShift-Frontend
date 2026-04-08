import { House01Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchField } from "./SearchField"

interface TypeFilterProps {
  selectedType: string | null
  onSelect: (val: string | null) => void
  t: any
}

export const TypeFilter = ({
  selectedType,
  onSelect,
  t,
}: TypeFilterProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <div className="flex flex-1">
        <SearchField
          label={t("home.search.type.label", "Tipo")}
          icon={<House01Icon size={18} />}
          className="w-full"
        >
          <span className={`truncate text-xs font-medium sm:text-sm ${selectedType ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
            {selectedType || t("home.search.type.placeholder", "Cualquier tipo")}
          </span>
        </SearchField>
      </div>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-64 border-slate-200 p-2 shadow-2xl dark:border-slate-800">
      <div className="grid grid-cols-1 gap-1">
        {["Casa", "Departamento", "Terreno", "Oficina"].map((tipo) => (
          <Button
            key={tipo}
            variant={selectedType === tipo ? "secondary" : "ghost"}
            className={`justify-start text-xs sm:text-sm ${selectedType === tipo ? "bg-slate-100 font-bold text-primary dark:bg-slate-800" : ""}`}
            onClick={() => onSelect(tipo === selectedType ? null : tipo)}
          >
            {tipo}
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
)
