import { useEffect } from "react"
import { Loading01Icon, RefreshIcon, WifiOff01Icon } from "hugeicons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { useScanTuyaDevicesQuery } from "../store"
import type { WizardAction } from "./usePlugScanWizard"

type ScanStepProps = {
  dispatch: React.Dispatch<WizardAction>
}

export const ScanStep = ({ dispatch }: ScanStepProps) => {
  const { isLoading, isError, refetch } = useScanTuyaDevicesQuery()

  useEffect(() => {
    if (!isLoading && !isError) {
      dispatch({ type: "GO_TO_SELECTING" })
    }
  }, [isLoading, isError, dispatch])

  if (isError) {
    return (
      <Alert variant="destructive">
        <WifiOff01Icon />
        <AlertTitle>No se pudo conectar con Tuya Cloud</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          Verifica la conexión a internet e intenta nuevamente.
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshIcon size={16} />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Loading01Icon className="animate-spin text-muted-foreground" size={32} />
      <p className="text-sm text-muted-foreground">
        Buscando dispositivos en tu cuenta Tuya...
      </p>
    </div>
  )
}
