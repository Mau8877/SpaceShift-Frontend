import { ReactNode } from "react"
import { ColumnDef, OnChangeFn, SortingState, Table } from "@tanstack/react-table"

// 1. Interfaz para los filtros y buscador (Header)
export interface DataTableHeaderProps<TData> {
  // Búsqueda
  enableSearch?: boolean
  searchPlaceholder?: string
  searchValue: string
  onSearchValueChange: (value: string) => void
  onSearchTrigger: () => void
  
  // Filtros Extra
  enableStatusFilter?: boolean
  statusValue?: string
  onStatusChange?: (value: string) => void
  
  enableDateFilter?: boolean
  dateRange?: any // Tipar según tu librería de fechas si es necesario
  onDateRangeChange?: (range: any) => void
  
  // Acciones Globales
  onRefresh?: () => void
  onAdd?: () => void
  isLoading?: boolean
  
  // Botón Reset
  onReset?: () => void
  isFiltered: boolean
}

// 2. Interfaz para la paginación (Footer)
export interface DataTablePaginationProps {
  pageIndex: number
  pageCount: number
  totalRecords: number
  onPageChange: (index: number) => void
  pageSize: number
}

// 3. Propiedades principales de la DataTable (El Ensamble)
export interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  isLoading?: boolean
  
  // Configuración de UI
  searchPlaceholder?: string
  enableSearch?: boolean
  enableStatusFilter?: boolean
  enableDateFilter?: boolean
  
  // Estado Controlado (Search)
  searchValue: string
  onSearchValueChange: (value: string) => void
  onSearchTrigger: () => void
  
  // Estado Controlado (Pagination)
  manualPagination?: boolean
  pageCount: number
  pageIndex: number
  onPageChange: (index: number) => void
  totalRecords: number
  
  // Estado Controlado (Sorting)
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  
  // Callbacks de fila
  onRefresh?: () => void
  onAdd?: () => void
  onDetail?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  onReset?: () => void
}