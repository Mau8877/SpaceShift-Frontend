import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Search01Icon,
} from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { SearchFilters } from "../properties/columns"
import { LocationFilter } from "./SearchFilters/LocationFilter"
import { TypeFilter } from "./SearchFilters/TypeFilter"
import { PriceFilter } from "./SearchFilters/PriceFilter"

export function HomeSearchBar({ onSearch }: { onSearch?: (filters: SearchFilters) => void }) {
  const { t } = useTranslation()
  const [location, setLocation] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null }>({
    min: 0,
    max: null,
  })

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        location,
        type: selectedType,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      })
    }
  }

  return (
    <div className="mx-auto -mt-[1px] w-full max-w-4xl px-4 relative z-20">
      <div className="flex h-16 items-stretch gap-1 border border-slate-200 bg-white p-1 shadow-xl transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:h-20 sm:gap-2 sm:p-2 rounded-b-[32px] rounded-t-none">

        <LocationFilter location={location} onSelect={setLocation} t={t} />
        <Separator orientation="vertical" className="my-auto h-8 bg-slate-100 dark:bg-slate-800" />
        <TypeFilter selectedType={selectedType} onSelect={setSelectedType} t={t} />
        <Separator orientation="vertical" className="my-auto h-8 bg-slate-100 dark:bg-slate-800" />
        <PriceFilter priceRange={priceRange} onPriceChange={setPriceRange} t={t} />
        {/* Botón Buscar */}
        <div className="flex items-center px-1 sm:px-2">
          <Button
            onClick={handleSearch}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary p-0 shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 sm:h-14 sm:w-auto sm:px-6 sm:gap-2"
          >
            <Search01Icon size={20} strokeWidth={2.5} className="text-white sm:size-6" />
            <span className="hidden font-bold text-white sm:inline-block">
              {t("home.search.button", "Buscar")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
