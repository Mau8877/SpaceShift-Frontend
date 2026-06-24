import { AlertCircleIcon, PlugSocketIcon } from "hugeicons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { useScanTuyaDevicesQuery } from "../store"
import type { WizardAction } from "./usePlugScanWizard"

type SelectDeviceStepProps = {
  dispatch: React.Dispatch<WizardAction>
}

export const SelectDeviceStep = ({ dispatch }: SelectDeviceStepProps) => {
  const { data: devices = [] } = useScanTuyaDevicesQuery()

  if (devices.length === 0) {
    return (
      <Alert>
        <AlertCircleIcon />
        <AlertTitle>No se encontraron dispositivos nuevos</AlertTitle>
        <AlertDescription>
          Asegúrate de haber conectado el enchufe con Smart Life antes de escanear.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
      {devices.map((device) => {
        const disabled = device.alreadyRegistered

        return (
          <button
            key={device.tuyaDeviceId}
            type="button"
            disabled={disabled}
            onClick={() => dispatch({ type: "SELECT_DEVICE", device })}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2">
              <PlugSocketIcon size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{device.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  ID: {device.tuyaDeviceId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {disabled ? (
                <Badge variant="secondary">Ya en sistema</Badge>
              ) : device.online ? (
                <Badge className="bg-emerald-100 text-emerald-800">Online</Badge>
              ) : (
                <Badge variant="destructive" className="border">
                  Offline
                </Badge>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
