import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { useRegisterPlugMutation } from "../store"
import type { WizardAction, WizardState } from "./usePlugScanWizard"

type NamingStepProps = {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

export const NamingStep = ({ state, dispatch }: NamingStepProps) => {
  const [registerPlug, { isLoading }] = useRegisterPlugMutation()
  const device = state.selectedDevice

  if (!device) {
    return null
  }

  const handleSubmit = async () => {
    if (state.alias.trim().length < 3) {
      toast.error("El alias debe tener al menos 3 caracteres")
      return
    }

    dispatch({ type: "START_REGISTERING" })

    try {
      const plug = await registerPlug({
        tuyaDeviceId: device.tuyaDeviceId,
        alias: state.alias.trim(),
        notes: state.notes.trim() || undefined,
      }).unwrap()

      dispatch({ type: "REGISTERED", plugId: plug.id })
    } catch (error: any) {
      const status = error?.status
      if (status === 409) {
        toast.error("Este enchufe ya está registrado en el sistema.")
      } else {
        toast.error("No se pudo registrar el enchufe", {
          description: error?.data?.message ?? "Intenta nuevamente.",
        })
      }
      dispatch({ type: "SELECT_DEVICE", device })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-medium">{device.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {device.tuyaDeviceId.slice(0, 8)}...
            </p>
          </div>
          {device.online ? (
            <Badge className="bg-emerald-100 text-emerald-800">Online</Badge>
          ) : (
            <Badge variant="destructive">Offline</Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-2">
        <Label htmlFor="plug-alias">Alias del enchufe</Label>
        <Input
          id="plug-alias"
          placeholder="Ej: Enchufe TV Habitación 1"
          value={state.alias}
          onChange={(event) => dispatch({ type: "SET_ALIAS", alias: event.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="plug-notes">Notas (opcional)</Label>
        <Textarea
          id="plug-notes"
          placeholder="Observaciones de instalación"
          value={state.notes}
          onChange={(event) => dispatch({ type: "SET_NOTES", notes: event.target.value })}
        />
      </div>

      <Button type="button" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Registrando..." : "Registrar enchufe"}
      </Button>
    </div>
  )
}
