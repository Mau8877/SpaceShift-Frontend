import { useState } from "react"
import { toast } from "sonner"
import { Calendar03Icon } from "hugeicons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import {
  useGetPendingTicketsQuery,
  useUpdateTicketStatusMutation,
} from "../store"

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "hace minutos"
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${Math.floor(diffHours / 24)}d`
}

export const PendingTicketsPanel = () => {
  const { data: tickets = [] } = useGetPendingTicketsQuery(undefined, {
    pollingInterval: 60_000,
  })
  const [updateTicketStatus] = useUpdateTicketStatusMutation()
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  const handleSchedule = async (ticketId: string, date: Date | undefined) => {
    if (!date) return

    try {
      await updateTicketStatus({
        ticketId,
        data: { status: "SCHEDULED", scheduledAt: date.toISOString() },
      }).unwrap()
      toast.success("Visita programada correctamente")
    } catch (error: any) {
      toast.error("No se pudo programar la visita", {
        description: error?.data?.message,
      })
    } finally {
      setOpenPopoverId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Instalaciones pendientes</CardTitle>
        <Badge variant="secondary">{tickets.length}</Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay instalaciones pendientes</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">Inmueble: {ticket.propertyName}</p>
              <p className="text-xs text-muted-foreground">
                Solicitado: {formatRelative(ticket.requestedAt)}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <Badge variant="outline">{ticket.status}</Badge>

                <Popover
                  open={openPopoverId === ticket.id}
                  onOpenChange={(open) => setOpenPopoverId(open ? ticket.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Calendar03Icon size={16} />
                      Programar visita
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      onSelect={(date) => handleSchedule(ticket.id, date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
