import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  totalRecords?: number
  pageSizeOptions?: number[]
}

const getPaginationRange = (currentPage: number, pageCount: number) => {
  const delta = 1
  const range: Array<number | string> = []

  for (let i = 1; i <= pageCount; i += 1) {
    if (
      i === 1 ||
      i === pageCount ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i)
    } else if (range[range.length - 1] !== "...") {
      range.push("...")
    }
  }

  return range
}

export const DataTablePagination = <TData,>({
  table,
  totalRecords,
  pageSizeOptions = [10, 20, 50],
}: DataTablePaginationProps<TData>) => {
  const pagination = table.getState().pagination

  const pageIndex = pagination.pageIndex
  const pageSize = pagination.pageSize

  const rawPageCount = table.getPageCount()
  const pageCount = rawPageCount > 0 ? rawPageCount : 1

  const total = totalRecords ?? table.getFilteredRowModel().rows.length
  const startRow = total === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, total)

  const paginationRange = getPaginationRange(pageIndex + 1, pageCount)

  return (
    <div className="grid gap-3 border-t border-slate-100 px-2 pt-3 md:grid-cols-3 md:items-center">
      <div className="text-center text-[11px] font-bold tracking-widest text-slate-500 uppercase md:text-left">
        {startRow}-{endRow} de <span className="text-slate-950">{total}</span>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center -space-x-px rounded-md shadow-sm">
          <Button
            type="button"
            variant="outline"
            className="h-8 w-8 rounded-l-md rounded-r-none border-slate-200 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            &lt;
          </Button>

          {paginationRange.map((page, index) =>
            page === "..." ? (
              <div
                key={`dots-${index}`}
                className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-slate-50 text-xs text-slate-400"
              >
                ...
              </div>
            ) : (
              <Button
                key={`page-${page}`}
                type="button"
                variant={page === pageIndex + 1 ? "default" : "outline"}
                className={cn(
                  "h-8 w-8 rounded-none border-slate-200 p-0 text-xs font-bold",
                  page === pageIndex + 1 && "z-10 bg-slate-950 text-white"
                )}
                onClick={() => table.setPageIndex((page as number) - 1)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            className="h-8 w-8 rounded-l-none rounded-r-md border-slate-200 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            &gt;
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 md:justify-end">
        <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
          Pág. <span className="text-slate-950">{pageIndex + 1}</span> /{" "}
          {pageCount}
        </p>

        <Select
          value={String(pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[92px] border-slate-200 text-xs">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} filas
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
