import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { NamingStep } from "./NamingStep"
import { ScanStep } from "./ScanStep"
import { SelectDeviceStep } from "./SelectDeviceStep"
import { TestStep } from "./TestStep"
import { usePlugScanWizard } from "./usePlugScanWizard"

type PlugScanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEP_TITLES: Record<string, string> = {
  scanning: "Buscando dispositivos",
  selecting: "Selecciona un dispositivo",
  naming: "Nombra el enchufe",
  registering: "Registrando enchufe",
  testing: "Probando conexión",
  done: "Resultado del test",
}

export const PlugScanDialog = ({ open, onOpenChange }: PlugScanDialogProps) => {
  const { state, dispatch } = usePlugScanWizard()

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      dispatch({ type: "RESET" })
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{STEP_TITLES[state.step]}</DialogTitle>
          <DialogDescription>
            Vincula un enchufe Dimax conectado previamente con la app Smart Life.
          </DialogDescription>
        </DialogHeader>

        {state.step === "scanning" ? <ScanStep dispatch={dispatch} /> : null}
        {state.step === "selecting" ? <SelectDeviceStep dispatch={dispatch} /> : null}
        {state.step === "naming" || state.step === "registering" ? (
          <NamingStep state={state} dispatch={dispatch} />
        ) : null}
        {state.step === "testing" || state.step === "done" ? (
          <TestStep state={state} dispatch={dispatch} onFinish={() => handleOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
