import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowDownLeft01Icon,
  Calendar01Icon,
  Delete02Icon,
  FilterRemoveIcon,
  Loading01Icon,
  PencilEdit01Icon,
  PlusSignIcon,
  RefreshIcon,
  Search01Icon,
  ViewIcon,
} from "hugeicons-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { DateRange } from "react-day-picker"
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  isLoading?: boolean
  searchPlaceholder?: string
  enableSearch?: boolean
  enableStatusFilter?: boolean
  enableDateFilter?: boolean
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  onSearchTrigger?: () => void
  manualPagination?: boolean
  pageCount?: number
  pageIndex?: number
  onPageChange?: (index: number) => void
  totalRecords?: number
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onRefresh?: () => void
  onAdd?: () => void
  onDetail?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Buscar...",
  enableSearch = false,
  enableStatusFilter = false,
  enableDateFilter = false,
  globalFilter: serverGlobalFilter,
  onGlobalFilterChange,
  onSearchTrigger,
  manualPagination = false,
  pageCount: serverPageCount,
  pageIndex: serverPageIndex,
  onPageChange,
  totalRecords,
  sorting,
  onSortingChange,
  onRefresh,
  onAdd,
  onDetail,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalFilter, setInternalFilter] = React.useState("")
  const [statusValue, setStatusValue] = React.useState<string>("all")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

  // 1. COLUMNA DE ACCIONES DINÁMICA
  const finalColumns = React.useMemo(() => {
    const hasActions = onDetail || onEdit || onDelete
    if (!hasActions) return columns

    const actionsColumn: ColumnDef<TData, TValue> = {
      id: "acciones",
      header: () => <div className="w-full text-center">ACCIONES</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          {onDetail && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDetail(row.original)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <ViewIcon size={18} />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row.original)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <PencilEdit01Icon size={18} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row.original)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Delete02Icon size={18} />
            </Button>
          )}
        </div>
      ),
    }
    return [...columns, actionsColumn]
  }, [columns, onDetail, onEdit, onDelete])

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount: serverPageCount ?? -1,
    manualPagination,
    state: {
      sorting: sorting ?? internalSorting,
      globalFilter: serverGlobalFilter ?? internalFilter,
      pagination: { pageIndex: serverPageIndex ?? 0, pageSize: 10 },
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // 2. DISPARADOR DE BÚSQUEDA
  const handleSearch = () => {
    if (onSearchTrigger) onSearchTrigger()
    else table.setGlobalFilter(serverGlobalFilter ?? internalFilter)
  }

  // 3. LÓGICA DE RESETEO (UI + LÓGICA)
  const isFiltered =
    (serverGlobalFilter || internalFilter) !== "" ||
    statusValue !== "all" ||
    dateRange !== undefined

  const handleReset = () => {
    if (onGlobalFilterChange) onGlobalFilterChange("")
    setInternalFilter("")
    setStatusValue("all")
    setDateRange(undefined)
    table.resetGlobalFilter()
    table.resetColumnFilters()
    if (onSearchTrigger) setTimeout(() => onSearchTrigger(), 0)
  }

  const pIndex = serverPageIndex ?? table.getState().pagination.pageIndex
  const pCount = serverPageCount ?? table.getPageCount()
  const total = totalRecords ?? table.getFilteredRowModel().rows.length
  const startRow = total === 0 ? 0 : pIndex * 10 + 1
  const endRow = Math.min((pIndex + 1) * 10, total)

  const getPaginationRange = () => {
    const current = pIndex + 1
    const last = pCount
    const delta = 1
    const range: (number | string)[] = []
    for (let i = 1; i <= last; i++) {
      if (
        i === 1 ||
        i === last ||
        (i >= current - delta && i <= current + delta)
      )
        range.push(i)
      else if (range[range.length - 1] !== "...") range.push("...")
    }
    return range
  }

  const hasLeftControls = enableSearch || enableStatusFilter || enableDateFilter

  return (
    <div className="space-y-4">
      {/* --- HEADER --- */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-t-lg border border-b-0 border-border bg-card p-3 shadow-sm md:flex-row">
        <div className="flex w-full flex-1 items-center gap-2">
          {enableSearch && (
            <div className="relative flex w-full max-w-xs items-center">
              <Search01Icon className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={serverGlobalFilter ?? internalFilter}
                onChange={(e) =>
                  onGlobalFilterChange
                    ? onGlobalFilterChange(e.target.value)
                    : setInternalFilter(e.target.value)
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-border bg-background pr-10 pl-9"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearch}
                className="absolute right-1 h-8 w-8 text-primary"
              >
                <ArrowDownLeft01Icon size={18} />
              </Button>
            </div>
          )}

          {enableStatusFilter && (
            <Select value={statusValue} onValueChange={setStatusValue}>
              <SelectTrigger className="w-[140px] border-border bg-background text-[11px] font-bold tracking-wider uppercase">
                <SelectValue placeholder="ESTADO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="processed">Procesados</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enableDateFilter && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[260px] justify-start border-border bg-background text-xs font-bold uppercase",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <Calendar01Icon className="mr-2 h-4 w-4 text-primary" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "dd LLL")} - ${format(dateRange.to, "dd LLL")}`
                      : format(dateRange.from, "dd LLL")
                    : "Rango de fechas"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 shadow-xl" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* BOTÓN RESET CONDICIONAL */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="animate-in gap-2 text-[10px] font-bold text-muted-foreground uppercase transition-colors duration-300 fade-in zoom-in hover:text-primary"
            >
              <FilterRemoveIcon size={16} /> Resetear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              className="border-border shadow-sm"
            >
              <RefreshIcon
                size={18}
                className={cn(isLoading && "animate-spin text-primary")}
              />
            </Button>
          )}
          {onAdd && (
            <Button
              onClick={onAdd}
              className="gap-2 bg-primary text-xs font-bold uppercase shadow-sm hover:opacity-90"
            >
              <PlusSignIcon size={18} /> Crear
            </Button>
          )}
        </div>
      </div>

      {/* --- TABLA CON LOADER CENTRAL --- */}
      <div className="relative min-h-[450px] overflow-hidden rounded-b-md border border-border bg-card">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-card/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 shadow-2xl">
              <Loading01Icon className="animate-spin text-primary" size={40} />
              <p className="animate-pulse text-sm font-bold tracking-widest text-foreground uppercase">
                Cargando...
              </p>
            </div>
          </div>
        )}
        <Table>
          <TableHeader className="bg-primary">
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-none hover:bg-transparent"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-4 py-4 text-[11px] font-bold tracking-widest text-primary-foreground uppercase",
                      header.id === "acciones" ? "text-center" : "text-left"
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border text-left transition-colors hover:bg-accent/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-3.5 text-sm font-medium",
                        cell.column.id === "acciones"
                          ? "text-center"
                          : "text-left"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length}
                  className="h-40 text-center text-muted-foreground italic"
                >
                  Sin registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- FOOTER CENTRALIZADO --- */}
      <div className="grid grid-cols-3 items-center border-t border-border/50 px-2 pt-2">
        <div className="text-left text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          {startRow}-{endRow} de <span className="text-primary">{total}</span>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex items-center -space-x-px rounded-md shadow-sm">
            <Button
              variant="outline"
              className="h-8 w-8 rounded-l-md rounded-r-none border-border p-0"
              onClick={() =>
                onPageChange ? onPageChange(pIndex - 1) : table.previousPage()
              }
              disabled={pIndex === 0}
            >
              &lt;
            </Button>
            {getPaginationRange().map((page, idx) =>
              page === "..." ? (
                <div
                  key={`dots-${idx}`}
                  className="flex h-8 w-8 items-center justify-center border border-border bg-muted/10 text-xs text-muted-foreground"
                >
                  ...
                </div>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={page === pIndex + 1 ? "default" : "outline"}
                  className={cn(
                    "h-8 w-8 rounded-none border-border p-0 text-xs font-bold transition-all",
                    page === pIndex + 1 && "z-10 shadow-inner"
                  )}
                  onClick={() =>
                    onPageChange
                      ? onPageChange((page as number) - 1)
                      : table.setPageIndex((page as number) - 1)
                  }
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              className="h-8 w-8 rounded-l-none rounded-r-md border-border p-0"
              onClick={() =>
                onPageChange ? onPageChange(pIndex + 1) : table.nextPage()
              }
              disabled={pIndex >= pCount - 1}
            >
              &gt;
            </Button>
          </div>
        </div>
        <div className="text-right text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Pág. <span className="text-primary">{pIndex + 1}</span> / {pCount}
        </div>
      </div>
    </div>
  )
}
