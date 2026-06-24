import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAssignPlugMutation, useGetInmueblesConDispositivosQuery } from "../store"

type AssignPlugDialogProps = {
  plugId: string | null
  onOpenChange: (open: boolean) => void
}

export const AssignPlugDialog = ({ plugId, onOpenChange }: AssignPlugDialogProps) => {
  const open = plugId !== null
  const { data: inmuebles = [], isLoading } = useGetInmueblesConDispositivosQuery(undefined, {
    skip: !open,
  })
  const [assignPlug, { isLoading: isAssigning }] = useAssignPlugMutation()

  const [inmuebleId, setInmuebleId] = useState<string>("")
  const [dispositivoId, setDispositivoId] = useState<string>("")

  const inmueble = inmuebles.find((i) => i.id === inmuebleId)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setInmuebleId("")
      setDispositivoId("")
    }
    onOpenChange(next)
  }

  const handleAssign = async () => {
    if (!plugId || !inmuebleId || !dispositivoId) return

    try {
      await assignPlug({ plugId, inmuebleId, dispositivoId }).unwrap()
      toast.success("Enchufe asignado correctamente")
      handleOpenChange(false)
    } catch (error: any) {
      toast.error("No se pudo asignar el enchufe", {
        description: error?.data?.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar enchufe</DialogTitle>
          <DialogDescription>
            Selecciona el inmueble y el dispositivo al que quedará conectado este enchufe.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label>Inmueble</Label>
            <Select
              value={inmuebleId}
              onValueChange={(value) => {
                setInmuebleId(value)
                setDispositivoId("")
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un inmueble"} />
              </SelectTrigger>
              <SelectContent>
                {inmuebles.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Dispositivo</Label>
            <Select
              value={dispositivoId}
              onValueChange={setDispositivoId}
              disabled={!inmueble || inmueble.dispositivos.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !inmueble
                      ? "Primero elige un inmueble"
                      : inmueble.dispositivos.length === 0
                        ? "Este inmueble no tiene dispositivos registrados"
                        : "Selecciona un dispositivo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {inmueble?.dispositivos.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!inmuebleId || !dispositivoId || isAssigning}
          >
            {isAssigning ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
