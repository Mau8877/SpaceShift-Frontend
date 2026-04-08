import { Sorting01Icon } from "hugeicons-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Property {
  id: string
  name: string
  type: string
  price: number
  status: "pending" | "processed" | "error"
  location: string
  category: string
}

export interface SearchFilters {
  location: string
  type: string | null
  minPrice: number
  maxPrice: number | null
}

export const propertyColumns: Array<ColumnDef<Property>> = [
  { accessorKey: "name", header: "Inmueble" },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="gap-2 p-0 text-[11px] font-semibold hover:bg-transparent"
      >
        PRECIO <Sorting01Icon size={14} />
      </Button>
    ),
    cell: ({ row }) => `$${row.original.price.toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: "ESTADO",
    cell: ({ row }) => {
      const status = row.original.status
      const styles = {
        processed: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
        pending: "bg-amber-500/15 text-amber-600 border-amber-200",
        error: "bg-destructive/15 text-destructive border-destructive/20",
      }
      return (
        <Badge variant="outline" className={styles[status]}>
          {status.toUpperCase()}
        </Badge>
      )
    },
  },
]
