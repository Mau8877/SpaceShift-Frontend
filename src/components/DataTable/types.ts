import type {
  ColumnDef,
  OnChangeFn,
  Row,
  SortingState,
} from "@tanstack/react-table"
import type { ReactNode } from "react"
import type { DateRange } from "react-day-picker"

export type DataTableActionIcon = React.ComponentType<{
  size?: number
  className?: string
}>

export type DataTableFilterOption = {
  label: string
  value: string
}

export type DataTableSelectFilter = {
  id: string
  label: string
  placeholder?: string
  value?: string
  allValue?: string
  columnId?: string
  options: DataTableFilterOption[]
  onChange?: (value: string) => void
}

export type DataTableSearchConfig = {
  enabled?: boolean
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: () => void
}

export type DataTableDateFilterConfig = {
  enabled?: boolean
  label?: string
  placeholder?: string
  value?: DateRange
  onChange?: (value: DateRange | undefined) => void
}

export type DataTableRowAction<TData> = {
  id: string
  label: string
  icon?: DataTableActionIcon
  onClick: (row: TData) => void
  variant?: "default" | "muted" | "destructive"
  hidden?: (row: TData) => boolean
  disabled?: (row: TData) => boolean
}

export type DataTableRenderMobileCard<TData> = (row: Row<TData>) => ReactNode

export type DataTableProps<TData, TValue> = {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>

  isLoading?: boolean
  className?: string

  search?: DataTableSearchConfig
  filters?: DataTableSelectFilter[]
  dateFilter?: DataTableDateFilterConfig

  emptyTitle?: string
  emptyMessage?: string

  manualPagination?: boolean
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  totalRecords?: number
  pageSizeOptions?: number[]
  onPageChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void

  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  onRefresh?: () => void
  onAdd?: () => void
  addLabel?: string

  actions?: Array<DataTableRowAction<TData>>
  onDetail?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void

  renderMobileCard?: DataTableRenderMobileCard<TData>
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
}
