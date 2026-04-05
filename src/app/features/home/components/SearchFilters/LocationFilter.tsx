import { MapsLocation01Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchField } from "./SearchField"
import { locations } from "../../properties/datos"

interface LocationFilterProps {
  location: string
  onSelect: (val: string) => void
  t: any
}

export const LocationFilter = ({
  location,
  onSelect,
  t,
}: LocationFilterProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <div className="flex flex-1">
        <SearchField
          label={t("home.search.location.label", "Ubicación")}
          icon={<MapsLocation01Icon size={18} />}
          className="w-full"
        >
          <span
            className={`truncate text-xs font-medium sm:text-sm ${location ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}
          >
            {location || t("home.search.location.placeholder", "¿A dónde vas?")}
          </span>
        </SearchField>
      </div>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      className="w-72 border-slate-200 p-2 shadow-2xl dark:border-slate-800"
    >
      <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto pr-1">
        {locations.map((loc) => (
          <Button
            key={loc}
            variant={location === loc ? "secondary" : "ghost"}
            className={`justify-start text-xs sm:text-sm ${location === loc ? "bg-slate-100 font-bold text-primary dark:bg-slate-800" : ""}`}
            onClick={() => onSelect(loc === location ? "" : loc)}
          >
            <MapsLocation01Icon
              size={14}
              className={location === loc ? "text-primary" : "text-slate-400"}
            />
            <span className="ml-2">{loc}</span>
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
)
