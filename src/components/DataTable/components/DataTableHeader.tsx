import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowDownLeft01Icon,
  Calendar01Icon,
  FilterRemoveIcon,
  PlusSignIcon,
  RefreshIcon,
  Search01Icon,
} from "hugeicons-react"

import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import type {
  DataTableDateFilterConfig,
  DataTableSearchConfig,
  DataTableSelectFilter,
} from "../types"

type DataTableHeaderProps<TData> = {
  table: Table<TData>
  isLoading: boolean
  search?: DataTableSearchConfig
  filters?: DataTableSelectFilter[]
  dateFilter?: DataTableDateFilterConfig
  globalFilterValue: string
  onGlobalFilterChange: (value: string) => void
  onReset: () => void
  isFiltered: boolean
  onRefresh?: () => void
  onAdd?: () => void
  addLabel?: string
}

export const DataTableHeader = <TData,>({
  table,
  isLoading,
  search,
  filters = [],
  dateFilter,
  globalFilterValue,
  onGlobalFilterChange,
  onReset,
  isFiltered,
  onRefresh,
  onAdd,
  addLabel = "Crear",
}: DataTableHeaderProps<TData>) => {
  const isSearchEnabled = search?.enabled ?? false
  const isDateFilterEnabled = dateFilter?.enabled ?? false
  const hasLeftControls =
    isSearchEnabled || filters.length > 0 || isDateFilterEnabled

  const handleSearch = () => {
    search?.onSearch?.()
  }

  const handleFilterChange = (filter: DataTableSelectFilter, value: string) => {
    const allValue = filter.allValue ?? "all"

    filter.onChange?.(value)

    if (filter.columnId) {
      table
        .getColumn(filter.columnId)
        ?.setFilterValue(value === allValue ? undefined : value)
    }
  }

  return (
    <div className="flex flex-col justify-between gap-3 rounded-t-2xl border border-b-0 border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">
      {hasLeftControls ? (
        <div className="flex w-full flex-1 flex-col gap-2 md:flex-row md:items-center">
          {isSearchEnabled ? (
            <div className="relative flex w-full items-center md:max-w-xs">
              <Search01Icon className="absolute left-3 h-4 w-4 text-slate-400" />

              <Input
                placeholder={search?.placeholder ?? "Buscar..."}
                value={globalFilterValue}
                onChange={(event) => onGlobalFilterChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch()
                  }
                }}
                className="border-slate-200 bg-white pr-10 pl-9"
              />

              {search?.onSearch ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSearch}
                  className="absolute right-1 h-8 w-8 text-slate-600 hover:text-slate-950"
                >
                  <ArrowDownLeft01Icon size={18} />
                </Button>
              ) : null}
            </div>
          ) : null}

          {filters.map((filter) => {
            const allValue = filter.allValue ?? "all"
            const columnValue =
              filter.columnId !== undefined
                ? table.getColumn(filter.columnId)?.getFilterValue()
                : undefined

            const value =
              filter.value ??
              (typeof columnValue === "string" ? columnValue : undefined) ??
              allValue

            return (
              <Select
                key={filter.id}
                value={value}
                onValueChange={(nextValue) =>
                  handleFilterChange(filter, nextValue)
                }
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-xs font-bold tracking-wide uppercase md:w-[170px]">
                  <SelectValue
                    placeholder={filter.placeholder ?? filter.label}
                  />
                </SelectTrigger>

                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          })}

          {isDateFilterEnabled ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start border-slate-200 bg-white text-xs font-bold uppercase md:w-[260px]",
                    !dateFilter?.value && "text-slate-500"
                  )}
                >
                  <Calendar01Icon className="mr-2 h-4 w-4 text-slate-600" />

                  {dateFilter?.value?.from
                    ? dateFilter.value.to
                      ? `${format(dateFilter.value.from, "dd LLL", {
                          locale: es,
                        })} - ${format(dateFilter.value.to, "dd LLL", {
                          locale: es,
                        })}`
                      : format(dateFilter.value.from, "dd LLL", {
                          locale: es,
                        })
                    : (dateFilter?.placeholder ?? "Rango de fechas")}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 shadow-xl" align="start">
                <Calendar
                  mode="range"
                  selected={dateFilter?.value}
                  onSelect={dateFilter?.onChange}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          ) : null}

          {isFiltered ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-950"
            >
              <FilterRemoveIcon size={16} />
              Resetear
            </Button>
          ) : null}
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="border-slate-200 shadow-sm"
          >
            <RefreshIcon
              size={18}
              className={cn(isLoading && "animate-spin text-slate-950")}
            />
          </Button>
        ) : null}

        {onAdd ? (
          <Button
            type="button"
            onClick={onAdd}
            className="gap-2 bg-slate-950 text-xs font-bold text-white uppercase shadow-sm hover:bg-slate-800"
          >
            <PlusSignIcon size={18} />
            {addLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
