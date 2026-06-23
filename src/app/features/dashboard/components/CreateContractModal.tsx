import * as React from "react"
import { useAppSelector } from "@/app/store"
import { useGetPublicacionesQuery } from "../../home/store/homeApi"
import { useGetMisPublicacionesQuery } from "../../publicaciones/store/publicacionApi"
import { useGetUsuariosQuery } from "../../admin/gestionar_usuarios/store/gestionarUsuariosApi"
import { useCrearContratoMutation } from "../store/contratoApi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Add01Icon, Delete02Icon, QuillWrite02Icon } from "hugeicons-react"
import type { ContractType } from "../types/mis-contratos.types"

interface CreateContractModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateContractModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateContractModalProps) {
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.rol === "ROLE_ADMIN"

  // Queries
  const { data: misPublicaciones = [], isLoading: isLoadingPubs } =
    useGetMisPublicacionesQuery()
  const { data: publicaciones = [], isLoading: isLoadingAllPubs } =
    useGetPublicacionesQuery(undefined, { skip: !isAdmin })
  const { data: usuariosData, isLoading: isLoadingUsers } = useGetUsuariosQuery({
    size: 100,
  })
  const [crearContrato, { isLoading: isCreating }] = useCrearContratoMutation()

  // Form States
  const [inmuebleId, setInmuebleId] = React.useState("")
  const [publicacionId, setPublicacionId] = React.useState("")
  const [idCliente, setIdCliente] = React.useState("")
  const [tipoContrato, setTipoContrato] = React.useState<ContractType>("ALQUILER")
  const [fechaInicio, setFechaInicio] = React.useState("")
  const [fechaFin, setFechaFin] = React.useState("")
  const [monto, setMonto] = React.useState<number>(0)
  const [moneda, setMoneda] = React.useState("Bs.")
  const [renovacionAutomatica, setRenovacionAutomatica] = React.useState(false)

  const handlePropertyChange = (selectedPubId: string) => {
    setPublicacionId(selectedPubId)
    if (!selectedPubId) {
      setInmuebleId("")
      return
    }

    const selectedPub = availableProperties.find(
      (p: any) => p.id?.toString() === selectedPubId
    )

    if (selectedPub) {
      setInmuebleId(selectedPub.inmueble.id)
      
      // Auto-completar tipo de contrato
      const transType = (selectedPub.tipoTransaccion || "").trim().toUpperCase()
      if (transType === "VENTA" || transType === "ALQUILER" || transType === "ANTICRETICO" || transType === "ALOJAMIENTO") {
        setTipoContrato(transType as ContractType)
      } else if (transType === "RESERVA_TEMPORAL" || transType === "AIRBNB") {
        setTipoContrato("ALOJAMIENTO")
      }
      
      // Auto-completar precio y moneda
      if (selectedPub.precio) {
        setMonto(selectedPub.precio)
      }
      if (selectedPub.moneda) {
        setMoneda(selectedPub.moneda)
      }
    }
  }

  // Especificaciones dinámicas
  const [specKey, setSpecKey] = React.useState("")
  const [specVal, setSpecVal] = React.useState("")
  const [specs, setSpecs] = React.useState<Record<string, string>>({
    garantia: "0",
    mascotasPermitidas: "No",
    serviciosIncluidos: "Luz, Agua",
  })

  // Filter available properties that are not already occupied if needed (optional)
  const availableProperties = React.useMemo(() => {
    const source = isAdmin ? publicaciones : misPublicaciones

    return source.filter((p: any) =>
      p.estadoPublicacion !== "ELIMINADO" &&
      p.inmueble?.estadoOperativo !== "ELIMINADO"
    )
  }, [isAdmin, misPublicaciones, publicaciones])

  const selectedProperty = React.useMemo(() => {
    if (!publicacionId) return null

    return availableProperties.find(
      (p: any) => p.id?.toString().toLowerCase() === publicacionId.toLowerCase()
    )
  }, [availableProperties, publicacionId])

  // Filter users to show only potential clients (excluding admins/owners if we want, or showing all)
  const clientsList = React.useMemo(() => {
    return usuariosData?.content || []
  }, [usuariosData])

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) {
      toast.warning("Cláusula incompleta", {
        description: "Especifica tanto el nombre como el valor de la cláusula.",
      })
      return
    }
    setSpecs((prev) => ({ ...prev, [specKey.trim().toLowerCase()]: specVal.trim() }))
    setSpecKey("")
    setSpecVal("")
  }

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inmuebleId || !publicacionId) {
      toast.error("Falta información", { description: "Selecciona un inmueble." })
      return
    }
    if (!idCliente) {
      toast.error("Falta información", { description: "Selecciona un cliente." })
      return
    }
    if (tipoContrato !== "VENTA" && !fechaInicio) {
      toast.error("Falta información", { description: "Selecciona la fecha de inicio." })
      return
    }
    if (monto <= 0) {
      toast.error("Monto inválido", { description: "El monto debe ser mayor a 0." })
      return
    }

    try {
      const payload = {
        idInmueble: inmuebleId,
        idPublicacion: publicacionId,
        idCliente,
        tipoContrato,
        fechaInicio: tipoContrato === "VENTA" ? undefined : fechaInicio,
        fechaFin: (tipoContrato === "VENTA" || !fechaFin) ? undefined : fechaFin,
        montoAcordado: monto,
        moneda,
        especificaciones: specs,
      }

      await crearContrato(payload).unwrap()
      toast.success("Propuesta de contrato creada", {
        description: "Se ha enviado la propuesta de firma al cliente.",
      })
      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      toast.error("Error al crear propuesta", {
        description: error?.data?.message || "Ocurrió un error inesperado.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <QuillWrite02Icon className="h-5 w-5 text-indigo-600" />
            <span>Crear Propuesta de Contrato</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Define las especificaciones de alquiler, venta o alojamiento para enviarla al cliente para su firma digital.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4 bg-slate-100" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleccionar Inmueble */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Inmueble</label>
              {isLoadingPubs || (isAdmin && isLoadingAllPubs) ? (
                <div className="h-10 animate-pulse bg-slate-100 rounded-xl" />
              ) : (
                <select
                  value={publicacionId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Selecciona propiedad --</option>
                  {availableProperties.map((p: any) => {
                    const ownerLabel = isAdmin && p.correoUsuario ? ` - ${p.correoUsuario}` : ""

                    return (
                      <option key={p.id} value={p.id}>
                        {p.titulo} ({p.inmueble.tipoInmueble.toLowerCase()} - {p.tipoTransaccion.toLowerCase()}{ownerLabel})
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            {/* Seleccionar Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cliente (Usuario Registrado)</label>
              {isLoadingUsers ? (
                <div className="h-10 animate-pulse bg-slate-100 rounded-xl" />
              ) : (
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Selecciona cliente --</option>
                  {clientsList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} ({c.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedProperty?.inmueble && (
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reglas heredadas del inmueble
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Condiciones / reglas
                    </p>
                    <p className="mt-1 whitespace-pre-line text-slate-700">
                      {selectedProperty.inmueble.condiciones || "No se registraron condiciones para este inmueble."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                      Multas y sanciones
                    </p>
                    <p className="mt-1 whitespace-pre-line text-slate-700">
                      {selectedProperty.inmueble.multasSanciones || "No se registraron sanciones para este inmueble."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tipo de Contrato */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de Contrato</label>
              <select
                value={tipoContrato}
                onChange={(e) => setTipoContrato(e.target.value as ContractType)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALQUILER">Alquiler</option>
                <option value="VENTA">Venta</option>
                <option value="ANTICRETICO">Anticretico</option>
                <option value="ALOJAMIENTO">Alojamiento (Airbnb/Temporal)</option>
              </select>
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Bs.">Bolivianos (Bs.)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            {/* Monto de la Transacción */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {tipoContrato === "VENTA" ? "Monto Total de Venta" : "Monto Mensual / Alquiler"}
              </label>
              <input
                type="number"
                min="1"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Renovación Automática */}
            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="renovacion"
                checked={renovacionAutomatica}
                onChange={(e) => setRenovacionAutomatica(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="renovacion" className="text-sm font-semibold text-slate-700 select-none">
                Permitir Renovación Automática
              </label>
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha de Finalización</label>
              <input
                type="date"
                value={fechaFin}
                disabled={tipoContrato === "VENTA"}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <Separator className="my-4 bg-slate-100" />

          {/* Cláusulas / Especificaciones Adicionales */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Cláusulas del Contrato (Especificaciones)</h4>
            
            {/* Listar cláusulas actuales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{val}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(key)}
                      className="p-1 rounded hover:bg-rose-100 text-rose-600"
                    >
                      <Delete02Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs para nueva cláusula */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre Cláusula</label>
                <input
                  type="text"
                  placeholder="Ej: garantia, mascotas"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor Cláusula</label>
                <input
                  type="text"
                  placeholder="Ej: 3000, Permitidas"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddSpec}
                className="w-full h-9 gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold"
              >
                <Add01Icon className="h-4 w-4" />
                Agregar Cláusula
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {isCreating ? "Creando propuesta..." : "Enviar Propuesta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
