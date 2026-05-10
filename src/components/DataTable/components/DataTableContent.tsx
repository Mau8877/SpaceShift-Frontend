import { flexRender } from "@tanstack/react-table"

import type { Table } from "@tanstack/react-table"

import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import type { DataTableRenderMobileCard } from "../types"
import { DataTableLoader } from "./DataTableLoader"

type DataTableContentProps<TData> = {
  table: Table<TData>
  columnsLength: number
  isLoading: boolean
  emptyTitle?: string
  emptyMessage?: string
  renderMobileCard?: DataTableRenderMobileCard<TData>
}

export const DataTableContent = <TData,>({
  table,
  columnsLength,
  isLoading,
  emptyTitle = "Sin registros",
  emptyMessage = "No se encontraron datos para mostrar.",
  renderMobileCard,
}: DataTableContentProps<TData>) => {
  const rows = table.getRowModel().rows

  return (
    <div className="relative min-h-[450px] overflow-hidden rounded-b-2xl border border-slate-200 bg-white">
      {isLoading ? <DataTableLoader /> : null}

      {renderMobileCard ? (
        <div className="grid gap-3 p-3 md:hidden">
          {rows.length > 0 ? (
            rows.map((row) => <div key={row.id}>{renderMobileCard(row)}</div>)
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">
                {emptyTitle}
              </p>
              <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      ) : null}

      <div className={cn(renderMobileCard && "hidden md:block")}>
        <div className="overflow-x-auto">
          <ShadcnTable>
            <TableHeader className="bg-slate-950">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-none hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-4 py-4 text-[11px] font-bold tracking-widest text-white uppercase",
                        header.id === "acciones" ? "text-center" : "text-left"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-slate-100 text-left transition-colors hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4 py-3.5 text-sm font-medium text-slate-700",
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
                  <TableCell colSpan={columnsLength} className="h-44">
                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        {emptyTitle}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {emptyMessage}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </ShadcnTable>
        </div>
      </div>
    </div>
  )
}
