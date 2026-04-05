import { DollarCircleIcon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchField } from "./SearchField"

interface PriceFilterProps {
  priceRange: { min: number; max: number | null }
  onPriceChange: (range: { min: number; max: number | null }) => void
  t: any
}

export const PriceFilter = ({
  priceRange,
  onPriceChange,
  t,
}: PriceFilterProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <div className="flex flex-1">
        <SearchField
          label={t("home.search.price.label", "Precio")}
          icon={<DollarCircleIcon size={18} />}
          className="w-full"
        >
          <span className={`truncate text-xs font-medium sm:text-sm ${priceRange.max ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
            {priceRange.max
              ? `$${priceRange.min} - $${priceRange.max}`
              : t("home.search.price.placeholder", "Añadir presupuesto")}
          </span>
        </SearchField>
      </div>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      className="w-80 border-slate-200 p-4 shadow-2xl dark:border-slate-800"
    >
      <h4 className="mb-4 text-sm font-bold">Rango de precio</h4>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mínimo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-3 text-sm font-medium outline-hidden transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => onPriceChange({ ...priceRange, min: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="h-6 w-4 border-b border-slate-200 self-end mb-4"></div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Máximo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-3 text-sm font-medium outline-hidden transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900"
              placeholder="Máx"
              value={priceRange.max || ""}
              onChange={(e) => onPriceChange({ ...priceRange, max: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-slate-500 hover:text-slate-900"
          onClick={() => onPriceChange({ min: 0, max: null })}
        >
          Limpiar
        </Button>
      </div>
    </PopoverContent>
  </Popover>
)
