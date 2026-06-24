import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QuillWrite02Icon } from "hugeicons-react"

interface RentalSummaryCardProps {
  nights: number
  moneda: string
  precioBase: number
  showDevices: boolean
  totalDevices: number
  selectedDevicesCount: number
  totalFinal: number
  isCreating: boolean
  onSubmit: () => void
}

export function RentalSummaryCard({
  nights,
  moneda,
  precioBase,
  showDevices,
  totalDevices,
  selectedDevicesCount,
  totalFinal,
  isCreating,
  onSubmit,
}: RentalSummaryCardProps) {
  return (
    <Card className="sticky top-24 overflow-hidden border-2 border-primary/10 bg-background shadow-xl">
      <div className="space-y-6 p-6">
        <h3 className="text-lg font-bold">Resumen de la Oferta</h3>
        
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Precio estancia {nights > 0 ? `(${nights} ${nights === 1 ? 'noche' : 'noches'})` : ''}</span>
            <span className="font-semibold text-foreground">
              {moneda} {precioBase.toLocaleString()}
            </span>
          </div>

          {showDevices && totalDevices > 0 && (
            <div className="flex justify-between items-center text-muted-foreground border-t border-border/50 pt-3">
              <span>Dispositivos inteligentes ({selectedDevicesCount})</span>
              <span className="font-semibold text-foreground">
                {moneda} {totalDevices.toLocaleString()}
              </span>
            </div>
          )}

          <Separator className="bg-border/50" />

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-bold text-foreground">Total Estimado</span>
            <span className="text-xl font-black text-primary">
              {moneda} {totalFinal.toLocaleString()}
            </span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-12 gap-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
          onClick={onSubmit}
          disabled={isCreating}
        >
          <QuillWrite02Icon className="h-6 w-6" />
          {isCreating ? "Enviando oferta..." : "Confirmar Oferta"}
        </Button>

        <p className="text-center text-[10px] leading-tight font-medium tracking-widest text-muted-foreground uppercase">
          Al confirmar se creará un contrato que deberá ser pagado para activarse
        </p>
      </div>
    </Card>
  )
}
