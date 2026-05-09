import {
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import {
  createDefaultDataTableActions,
  DataTableActionsCell,
  DataTableContent,
  DataTableHeader,
  DataTablePagination,
} from "./components"
import type { DataTableProps, DataTableRowAction } from "./types"

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  className,

  search,
  filters = [],
  dateFilter,

  emptyTitle = "Sin registros",
  emptyMessage = "No se encontraron datos para mostrar.",

  manualPagination = false,
  pageCount,
  pageIndex,
  pageSize,
  totalRecords,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,

  sorting,
  onSortingChange,

  onRefresh,
  onAdd,
  addLabel = "Crear",
  toolbarContent,
  rightActions,

  actions,
  onDetail,
  onEdit,
  onDelete,

  renderMobileCard,
  getRowId,
  showPaginationSizeSelector = true,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: pageSize ?? 10,
    })

  const globalFilterValue = search?.value ?? internalGlobalFilter

  const rowActions = React.useMemo<Array<DataTableRowAction<TData>>>(() => {
    if (actions) {
      return actions
    }

    return createDefaultDataTableActions({
      onDetail,
      onEdit,
      onDelete,
    })
  }, [actions, onDelete, onDetail, onEdit])

  const finalColumns = React.useMemo<Array<ColumnDef<TData, TValue>>>(() => {
    if (rowActions.length === 0) {
      return columns
    }

    const actionsColumn: ColumnDef<TData, TValue> = {
      id: "acciones",
      header: () => <div className="w-full text-center">Acciones</div>,
      cell: ({ row }) => (
        <DataTableActionsCell row={row.original} actions={rowActions} />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }

    return [...columns, actionsColumn]
  }, [columns, rowActions])

  const currentPagination = React.useMemo<PaginationState>(
    () => ({
      pageIndex: pageIndex ?? internalPagination.pageIndex,
      pageSize: pageSize ?? internalPagination.pageSize,
    }),
    [
      internalPagination.pageIndex,
      internalPagination.pageSize,
      pageIndex,
      pageSize,
    ]
  )

  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      if (search?.onChange) {
        search.onChange(value)
        return
      }

      setInternalGlobalFilter(value)
    },
    [search]
  )

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    manualPagination,
    getRowId,
    state: {
      sorting: sorting ?? internalSorting,
      globalFilter: globalFilterValue,
      pagination: currentPagination,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onGlobalFilterChange: (updater) => {
      const nextValue = functionalUpdate(updater, globalFilterValue)

      handleGlobalFilterChange(String(nextValue ?? ""))
    },
    onPaginationChange: (updater) => {
      const nextPagination = functionalUpdate(updater, currentPagination)
      onPaginationChange?.(updater)

      if (manualPagination) {
        const pageSizeChanged = nextPagination.pageSize !== currentPagination.pageSize

        if (pageSizeChanged) {
          onPageSizeChange?.(nextPagination.pageSize)
          onPageChange?.(0)
          return
        }

        onPageChange?.(nextPagination.pageIndex)
      } else {
        setInternalPagination(nextPagination)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const hasSearchFilter = globalFilterValue.trim() !== ""

  const hasSelectFilters = filters.some((filter) => {
    const allValue = filter.allValue ?? "all"
    const columnValue =
      filter.columnId !== undefined
        ? table.getColumn(filter.columnId)?.getFilterValue()
        : undefined

    const value =
      filter.value ??
      (typeof columnValue === "string" ? columnValue : undefined) ??
      allValue

    return value !== allValue
  })

  const hasDateFilter = Boolean(
    dateFilter?.value?.from || dateFilter?.value?.to
  )

  const isFiltered = hasSearchFilter || hasSelectFilters || hasDateFilter

  const handleReset = () => {
    handleGlobalFilterChange("")
    table.resetGlobalFilter()
    table.resetColumnFilters()

    filters.forEach((filter) => {
      filter.onChange?.(filter.allValue ?? "all")
    })

    dateFilter?.onChange?.(undefined)
    search?.onSearch?.()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableHeader
        table={table}
        isLoading={isLoading}
        search={search}
        filters={filters}
        dateFilter={dateFilter}
        globalFilterValue={globalFilterValue}
        onGlobalFilterChange={handleGlobalFilterChange}
        onReset={handleReset}
        isFiltered={isFiltered}
        onRefresh={onRefresh}
        onAdd={onAdd}
        addLabel={addLabel}
        toolbarContent={toolbarContent}
        rightActions={rightActions}
      />

      <DataTableContent
        table={table}
        columnsLength={finalColumns.length}
        isLoading={isLoading}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        renderMobileCard={renderMobileCard}
      />

      <DataTablePagination
        table={table}
        totalRecords={totalRecords}
        pageSizeOptions={pageSizeOptions}
        showSizeSelector={showPaginationSizeSelector}
      />
    </div>
  )
}
