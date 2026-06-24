import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CpuIcon, CheckmarkCircle02Icon, AlertCircleIcon } from "hugeicons-react"
import type { SelectedDevice } from "../../types/publicacion.types"

interface DeviceSelectionGridProps {
  devices: SelectedDevice[]
  onToggleDevice: (id: string) => void
  moneda: string
  nights: number
}

export function DeviceSelectionGrid({
  devices,
  onToggleDevice,
  moneda,
  nights,
}: DeviceSelectionGridProps) {
  if (devices.length === 0) return null

  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <CpuIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-bold">Dispositivos disponibles</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selecciona los dispositivos que deseas incluir en tu contrato. El precio se calcula por día.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {devices.map((device) => (
            <div
              key={device.id}
              onClick={() => onToggleDevice(device.id)}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                device.selected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border/50 bg-background hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      device.selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {device.selected && (
                      <CheckmarkCircle02Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{device.nombre}</p>
                    {device.descripcion && (
                      <p className="text-xs text-muted-foreground">
                        {device.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {device.maxHorasSeguidas != null &&
                        device.maxHorasSeguidas > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-200 bg-amber-50 text-amber-700"
                          >
                            Máx. {device.maxHorasSeguidas}h seguidas
                          </Badge>
                        )}
                      {device.horarioLimiteUso && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-rose-200 bg-rose-50 text-rose-700"
                        >
                          No disponible {device.horarioLimiteUso}–{device.horarioLimiteFin || "00:00"}
                        </Badge>
                      )}
                    </div>
                    {device.sancionIncumplimiento && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 mt-1.5 max-w-max">
                        <AlertCircleIcon className="h-3 w-3 text-rose-500" />
                        <span>Sanción: {device.sancionIncumplimiento}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {moneda} {device.precioPorDia.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">por día</p>
                  {device.selected && nights > 0 && (
                    <p className="mt-1 text-xs font-semibold text-primary/80">
                      = {moneda}{" "}
                      {(device.precioPorDia * nights).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
