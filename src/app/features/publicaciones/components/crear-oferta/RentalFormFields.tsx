import { Card } from "@/components/ui/card"
import { Calendar03Icon } from "hugeicons-react"

interface RentalFormFieldsProps {
  showDates: boolean
  fechaInicio: string
  setFechaInicio: (val: string) => void
  fechaFin: string
  setFechaFin: (val: string) => void
  todayStr: string
}

export function RentalFormFields({
  showDates,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  todayStr,
}: RentalFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Date Selection */}
      {showDates && (
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Calendar03Icon className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold">Fechas de la estancia</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fecha de finalización
                </label>
                <input
                  type="date"
                  min={fechaInicio || todayStr}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
