import { useState } from "react"
import { toast } from "sonner"
import { ChartLineData01Icon, FlashIcon, Link01Icon, MoreVerticalIcon, Wrench01Icon } from "hugeicons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useGetPlugsQuery, useTestPlugMutation, useUnassignPlugMutation } from "../store"
import type { PlugStatus, SmartPlug } from "../types"
import { AssignPlugDialog } from "./AssignPlugDialog"
import { PlugConsumptionDialog } from "./PlugConsumptionDialog"
import { PlugScanDialog } from "./PlugScanDialog"

const STATUS_BADGE: Record<PlugStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Disponible", className: "bg-emerald-100 text-emerald-800" },
  ASSIGNED: { label: "Asignado", className: "bg-sky-100 text-sky-800" },
  MAINTENANCE: { label: "Mantenimiento", className: "bg-amber-100 text-amber-800" },
}

export const PlugInventoryTable = () => {
  const { data: plugs = [], isLoading } = useGetPlugsQuery()
  const [unassignPlug] = useUnassignPlugMutation()
  const [testPlug] = useTestPlugMutation()
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [assignPlugId, setAssignPlugId] = useState<string | null>(null)
  const [consumptionPlug, setConsumptionPlug] = useState<SmartPlug | null>(null)

  const handleUnassign = async (plug: SmartPlug) => {
    try {
      await unassignPlug(plug.id).unwrap()
      toast.success(`${plug.alias} desasignado correctamente`)
    } catch (error: any) {
      toast.error("No se pudo desasignar el enchufe", {
        description: error?.data?.message,
      })
    }
  }

  const handleTest = async (plug: SmartPlug) => {
    try {
      const result = await testPlug(plug.id).unwrap()
      if (result.testPassed) {
        toast.success("Test exitoso", { description: result.message })
      } else {
        toast.error("El enchufe no respondió", { description: result.message })
      }
    } catch (error: any) {
      toast.error("No se pudo probar el enchufe", {
        description: error?.data?.message,
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventario de enchufes</CardTitle>
        <Button type="button" onClick={() => setScanDialogOpen(true)}>
          <FlashIcon size={16} />
          Vincular nuevo enchufe
        </Button>
      </CardHeader>

      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && plugs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aún no hay enchufes registrados.
                  </TableCell>
                </TableRow>
              ) : null}

              {plugs.map((plug) => {
                const statusBadge = STATUS_BADGE[plug.status]

                return (
                  <TableRow key={plug.id}>
                    <TableCell>{plug.alias}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="font-mono">
                            {plug.tuyaDeviceId.slice(0, 8)}...
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{plug.tuyaDeviceId}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {plug.currentAssignment
                        ? `${plug.currentAssignment.dispositivoNombre} · ${plug.currentAssignment.propertyName}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon">
                            <MoreVerticalIcon size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {plug.status === "AVAILABLE" ? (
                            <DropdownMenuItem onClick={() => setAssignPlugId(plug.id)}>
                              <Link01Icon size={16} />
                              Asignar
                            </DropdownMenuItem>
                          ) : null}
                          {plug.status === "ASSIGNED" ? (
                            <DropdownMenuItem onClick={() => handleUnassign(plug)}>
                              Desasignar
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTest(plug)}>
                            <Wrench01Icon size={16} />
                            Test de conexión
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConsumptionPlug(plug)}>
                            <ChartLineData01Icon size={16} />
                            Ver consumo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>

      <PlugScanDialog open={scanDialogOpen} onOpenChange={setScanDialogOpen} />
      <AssignPlugDialog
        plugId={assignPlugId}
        onOpenChange={(open) => setAssignPlugId(open ? assignPlugId : null)}
      />
      <PlugConsumptionDialog
        plug={consumptionPlug}
        onOpenChange={(open) => !open && setConsumptionPlug(null)}
      />
    </Card>
  )
}
