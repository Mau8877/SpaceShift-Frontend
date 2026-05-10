import { Delete02Icon, PencilEdit01Icon, ViewIcon } from "hugeicons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { DataTableRowAction } from "../types"

type DataTableActionsCellProps<TData> = {
  row: TData
  actions: Array<DataTableRowAction<TData>>
}

export const DataTableActionsCell = <TData,>({
  row,
  actions,
}: DataTableActionsCellProps<TData>) => {
  const visibleActions = actions.filter((action) => !action.hidden?.(row))

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {visibleActions.map((action) => {
        const Icon = action.icon
        const isDisabled = action.disabled?.(row) ?? false

        return (
          <Button
            key={action.id}
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            title={action.label}
            aria-label={action.label}
            onClick={() => action.onClick(row)}
            className={cn(
              "h-8 w-8 text-slate-500 hover:text-slate-950",
              action.variant === "destructive" &&
                "hover:bg-red-50 hover:text-red-600"
            )}
          >
            {Icon ? <Icon size={18} /> : null}
          </Button>
        )
      })}
    </div>
  )
}

export const createDefaultDataTableActions = <TData,>({
  onDetail,
  onEdit,
  onDelete,
}: {
  onDetail?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
}): Array<DataTableRowAction<TData>> => {
  const actions: Array<DataTableRowAction<TData>> = []

  if (onDetail) {
    actions.push({
      id: "detail",
      label: "Ver detalle",
      icon: ViewIcon,
      onClick: onDetail,
      variant: "muted",
    })
  }

  if (onEdit) {
    actions.push({
      id: "edit",
      label: "Editar",
      icon: PencilEdit01Icon,
      onClick: onEdit,
      variant: "muted",
    })
  }

  if (onDelete) {
    actions.push({
      id: "delete",
      label: "Eliminar",
      icon: Delete02Icon,
      onClick: onDelete,
      variant: "destructive",
    })
  }

  return actions
}
