import * as React from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useAppSelector } from "@/app/store"
import { useGetPublicacionByIdQuery } from "../store/publicacionApi"
import { useCrearContratoMutation } from "../../dashboard/store/contratoApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowLeft01Icon, CpuIcon } from "hugeicons-react"

// Schemas
import { ofertaAlquilerSchema, ofertaVentaSchema } from "../schemas/ofertaContratoSchema"

// Types
import type { SelectedDevice, CrearContratoPayload } from "../types/publicacion.types"

// Sub-components
import { PropertyBriefHeader } from "../components/crear-oferta/PropertyBriefHeader"
import { RentalFormFields } from "../components/crear-oferta/RentalFormFields"
import { DeviceSelectionGrid } from "../components/crear-oferta/DeviceSelectionGrid"
import { RentalSummaryCard } from "../components/crear-oferta/RentalSummaryCard"
import { ContractPaymentAndSignature } from "../components/crear-oferta/ContractPaymentAndSignature"

export function CrearOfertaScreen() {
  const { id } = useParams({ from: "/_auth/crear-oferta/$id" })
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const { data: publicacion, isLoading, error } = useGetPublicacionByIdQuery(id)
  const [crearContrato, { isLoading: isCreating }] = useCrearContratoMutation()
  const [contratoCreado, setContratoCreado] = React.useState<any>(null)

  // Form state
  const [fechaInicio, setFechaInicio] = React.useState("")
  const [fechaFin, setFechaFin] = React.useState("")
  const [devices, setDevices] = React.useState<SelectedDevice[]>([])
  const [observacion, setObservacion] = React.useState("")

  // Initialize devices from publicacion
  React.useEffect(() => {
    if (publicacion?.inmueble?.dispositivos) {
      setDevices(
        publicacion.inmueble.dispositivos.map((d: any) => ({
          id: d.id,
          nombre: d.nombre,
          descripcion: d.descripcion || "",
          precioPorDia: d.precioPorDia || 0,
          maxHorasSeguidas: d.maxHorasSeguidas || 0,
          horarioLimiteUso: d.horarioLimiteUso || "",
          configuracionTiempo: d.configuracionTiempo || "LIBRE",
          horarioInicio: d.horarioInicio || "",
          horarioFin: d.horarioFin || "",
          selected: false,
          sancionIncumplimiento: d.sancionIncumplimiento || "",
        }))
      )
    }
  }, [publicacion])

  // Derived
  const tipoTransaccion = (publicacion?.tipoTransaccion || "").trim().toUpperCase()
  const isRental = tipoTransaccion === "ALQUILER" || tipoTransaccion === "ALOJAMIENTO"
  const isAnticretico = tipoTransaccion === "ANTICRETICO"

  const showDevices = isRental
  const showDates = !isRental && !isAnticretico ? false : true // Only Venta does not show dates

  const nights = React.useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0
    const start = new Date(fechaInicio)
    const end = new Date(fechaFin)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }, [fechaInicio, fechaFin])

  const precioBase = publicacion?.precio || 0
  const moneda = publicacion?.moneda || "Bs."

  const selectedDevices = devices.filter((d) => d.selected)
  const totalDevices = React.useMemo(() => {
    return selectedDevices.reduce((sum, d) => sum + d.precioPorDia * (isRental ? nights : 1), 0)
  }, [selectedDevices, nights, isRental])

  const totalFinal = React.useMemo(() => {
    if (isRental) {
      return precioBase * nights + totalDevices
    }
    return precioBase
  }, [isRental, precioBase, nights, totalDevices])

  const toggleDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, selected: !d.selected } : d))
    )
  }

  const mapTipoContrato = (): "VENTA" | "ALQUILER" | "ANTICRETICO" | "ALOJAMIENTO" => {
    if (tipoTransaccion === "ALQUILER") return "ALQUILER"
    if (tipoTransaccion === "ALOJAMIENTO" || tipoTransaccion === "RESERVA_TEMPORAL" || tipoTransaccion === "AIRBNB") return "ALOJAMIENTO"
    if (tipoTransaccion === "ANTICRETICO") return "ANTICRETICO"
    return "VENTA"
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Debes iniciar sesión")
      return
    }

    // Zod validation
    if (showDates) {
      const result = ofertaAlquilerSchema.safeParse({
        fechaInicio,
        fechaFin,
        observacion,
      })
      if (!result.success) {
        const error = result.error.issues[0]
        toast.error(error.message)
        return
      }
    } else {
      const result = ofertaVentaSchema.safeParse({
        observacion,
      })
      if (!result.success) {
        const error = result.error.issues[0]
        toast.error(error.message)
        return
      }
    }

    if (totalFinal <= 0) {
      toast.error("El monto total debe ser mayor a 0")
      return
    }

    const dispositivosContrato = selectedDevices.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      descripcion: d.descripcion,
      precioPorDia: d.precioPorDia,
      precioContrato: d.precioPorDia * (isRental ? nights : 1),
      cantidad: 1,
      maxHorasSeguidas: d.maxHorasSeguidas,
      horarioLimiteUso: d.horarioLimiteUso,
      configuracionTiempo: d.configuracionTiempo,
      horarioInicio: d.horarioInicio,
      horarioFin: d.horarioFin,
      fechaInicioUso: fechaInicio,
      fechaFinUso: fechaFin,
      sancionIncumplimiento: d.sancionIncumplimiento,
    }))

    const payload: CrearContratoPayload = {
      idInmueble: publicacion.inmueble.id,
      idPublicacion: id,
      idCliente: user.id,
      tipoContrato: mapTipoContrato(),
      fechaInicio: showDates ? fechaInicio : undefined,
      fechaFin: isRental || isAnticretico ? fechaFin : undefined,
      montoAcordado: totalFinal,
      moneda,
      observacion: observacion || undefined,
      especificaciones: {
        precioBasePublicacion: precioBase,
        precioDispositivosTotal: totalDevices,
        dispositivosContrato,
        condicionesInmueble: publicacion.inmueble.condiciones || "",
        multasSancionesInmueble: publicacion.inmueble.multasSanciones || "",
        reglasContrato: publicacion.inmueble.condiciones || "",
        sancionesContrato: publicacion.inmueble.multasSanciones || "",
      },
    }

    try {
      const res = await crearContrato(payload as any).unwrap()
      toast.success("¡Contrato Creado!", {
        description: "Tu propuesta de contrato ha sido creada con éxito. Procede con el pago y firma.",
      })
      setContratoCreado(res)
    } catch (err: any) {
      toast.error("Error al crear la oferta", {
        description: err?.data?.message || "No se pudo enviar la propuesta.",
      })
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl animate-pulse space-y-6 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    )
  }

  // Error
  if (error || !publicacion) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Publicación no encontrada</h2>
        <p className="text-muted-foreground">
          La publicación que buscas no existe o ha sido dada de baja.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split("T")[0]

  if (contratoCreado) {
    return (
      <ContractPaymentAndSignature
        contratoCreado={contratoCreado}
        moneda={moneda}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-4xl space-y-6 py-6 md:py-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() =>
            navigate({ to: "/publicacion/$id", params: { id } })
          }
        >
          <ArrowLeft01Icon className="h-5 w-5" />
          <span>Volver a la publicación</span>
        </Button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3">
          <CpuIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">
            Crear oferta de contrato
          </h1>
          <p className="text-sm text-muted-foreground">
            Selecciona los detalles de tu estancia para generar un contrato automático.
          </p>
        </div>
      </div>

      {/* Property Summary */}
      <PropertyBriefHeader
        publicacion={publicacion}
        moneda={moneda}
        precioBase={precioBase}
        isRental={isRental}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column — Form */}
        <div className="space-y-6 lg:col-span-2">
          <RentalFormFields
            showDates={showDates}
            fechaInicio={fechaInicio}
            setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}
            setFechaFin={setFechaFin}
            todayStr={todayStr}
          />

          <DeviceSelectionGrid
            devices={devices}
            onToggleDevice={toggleDevice}
            moneda={moneda}
            nights={nights}
          />

          {/* Observations */}
          <Card className="overflow-hidden border border-border/50 shadow-sm">
            <div className="space-y-4 p-5">
              <h3 className="text-base font-bold">Observaciones adicionales</h3>
              <textarea
                rows={4}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Añade algún comentario o requerimiento especial para el propietario..."
                className="w-full rounded-xl border border-border/50 bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>
        </div>

        {/* Right Column — Summary */}
        <div className="lg:col-span-1">
          <RentalSummaryCard
            nights={nights}
            moneda={moneda}
            precioBase={precioBase}
            showDevices={showDevices}
            totalDevices={totalDevices}
            selectedDevicesCount={selectedDevices.length}
            totalFinal={totalFinal}
            isCreating={isCreating}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </motion.div>
  )
}
