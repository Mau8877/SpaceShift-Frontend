import * as React from "react"
import { useNavigate, useParams, Link } from "@tanstack/react-router"
import { useAppSelector, useAppDispatch } from "@/app/store"
import { useGetPublicacionByIdQuery } from "../store/publicacionApi"
import {
  useCrearContratoMutation,
  useGetPagosDeContratoQuery,
  useGenerarSesionPagoStripeMutation,
  useSubirComprobantePagoMutation,
  useFirmarContratoMutation,
  useGetContratoPorIdQuery,
} from "../../dashboard/store/contratoApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  ArrowLeft01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  CpuIcon,
  AlertCircleIcon,
  QuillWrite02Icon,
  SignatureIcon,
  CreditCardIcon,
  Upload01Icon,
} from "hugeicons-react"

interface SelectedDevice {
  id: string
  nombre: string
  descripcion: string
  precioPorDia: number
  maxHorasSeguidas?: number
  horarioLimiteUso?: string
  configuracionTiempo?: string
  horarioInicio?: string
  horarioFin?: string
  selected: boolean
}

export function CrearOfertaScreen() {
  const { id } = useParams({ from: "/_auth/crear-oferta/$id" })
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const { data: publicacion, isLoading, error } = useGetPublicacionByIdQuery(id)
  const [crearContrato, { isLoading: isCreating }] = useCrearContratoMutation()

  const [contratoCreado, setContratoCreado] = React.useState<any>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const contratoIdFromUrl = React.useMemo(() => new URLSearchParams(window.location.search).get("contratoId"), [])
  const { data: loadedContrato } = useGetContratoPorIdQuery(contratoIdFromUrl || "", { skip: !contratoIdFromUrl })

  React.useEffect(() => {
    console.log("[DEBUG - CrearOfertaScreen] Inicialización y parámetros de URL:", {
      href: window.location.href,
      origin: window.location.origin,
      search: window.location.search,
      contratoIdFromUrl,
      userIsAuthenticated: !!user,
    })
  }, [contratoIdFromUrl, user])

  React.useEffect(() => {
    if (loadedContrato) {
      console.log("[DEBUG - CrearOfertaScreen] Contrato cargado desde la URL:", loadedContrato)
      setContratoCreado(loadedContrato)
    }
  }, [loadedContrato])

  const { data: pagos = [], refetch: refetchPagos } = useGetPagosDeContratoQuery(
    contratoCreado?.id || "",
    { skip: !contratoCreado?.id }
  )

  const [subirComprobante, { isLoading: isSubiendo }] = useSubirComprobantePagoMutation()
  const [generarStripe, { isLoading: isGenerandoStripe }] = useGenerarSesionPagoStripeMutation()
  const [firmar, { isLoading: isFirmando }] = useFirmarContratoMutation()

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
        }))
      )
    }
  }, [publicacion])

  // Derived
  const tipoTransaccion = (publicacion?.tipoTransaccion || "").trim().toUpperCase()
  const isRental = tipoTransaccion === "ALQUILER" || tipoTransaccion === "ALOJAMIENTO"
  const isVenta = tipoTransaccion === "VENTA"
  const isAnticretico = tipoTransaccion === "ANTICRETICO"

  const showDevices = isRental
  const showDates = !isVenta

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

  const mapTipoContrato = () => {
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

    if (showDates && !fechaInicio) {
      toast.error("Selecciona la fecha de inicio")
      return
    }

    if (isRental && !fechaFin) {
      toast.error("Selecciona la fecha de finalización")
      return
    }

    if (isRental && nights <= 0) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio")
      return
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
    }))

    const payload = {
      idInmueble: publicacion.inmueble.id,
      idPublicacion: id,
      idCliente: user.id,
      tipoContrato: mapTipoContrato() as any,
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
      const res = await crearContrato(payload).unwrap()
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, pagoId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await subirComprobante({ pagoId, comprobante: file }).unwrap()
      toast.success("Comprobante subido", {
        description: "El propietario revisará tu transferencia pronto.",
      })
      refetchPagos()
    } catch (err: any) {
      toast.error("Error al subir archivo", {
        description: err?.data?.message || "No se pudo cargar el comprobante.",
      })
    }
  }

  const handleStripePayment = async (pagoId: string) => {
    try {
      const originUrl = window.location.origin
      console.log("[DEBUG - CrearOfertaScreen] Solicitando pago de Stripe:", {
        pagoId,
        originUrl,
      })
      const res = await generarStripe({ pagoId, originUrl }).unwrap()
      console.log("[DEBUG - CrearOfertaScreen] Respuesta de Stripe recibida:", res)
      if (res.stripeCheckoutUrl) {
        toast.info("Redirigiendo a Stripe...")
        window.location.href = res.stripeCheckoutUrl
      }
    } catch (err: any) {
      console.error("[DEBUG - CrearOfertaScreen] Error en handleStripePayment:", err)
      toast.error("Error al iniciar pago", {
        description: err?.data?.message || "No se pudo generar la sesión de Stripe.",
      })
    }
  }

  const handleSignContract = async () => {
    if (!contratoCreado?.id) return
    try {
      toast.info("Firmando contrato...", {
        description: "Registrando firma digital en la base de datos y Blockchain.",
      })
      await firmar({ id: contratoCreado.id }).unwrap()
      toast.success("Contrato firmado correctamente", {
        description: "Tu contrato está activo ahora.",
      })
      navigate({ to: `/dashboard/contratos/${contratoCreado.id}` })
    } catch (err: any) {
      toast.error("Error al firmar", {
        description: err?.data?.message || "No se pudo firmar el contrato.",
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
    const hasCompletedPayment = pagos.some((p) => p.estadoPago === "COMPLETADO")

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-2xl py-6 md:py-10 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3">
            <SignatureIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Pago y Firma de Contrato
            </h1>
            <p className="text-sm text-muted-foreground">
              Completa el pago inicial y firma el contrato para activarlo.
            </p>
          </div>
        </div>

        <Card className="border border-border/50 bg-background shadow-md p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">Código Contrato</p>
              <p className="text-base font-bold font-mono">{contratoCreado.codigo}</p>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 uppercase text-xs">
              {contratoCreado.tipoContrato}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Inmueble</p>
              <p className="font-semibold text-foreground truncate">{contratoCreado.inmuebleTitulo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Monto Acordado</p>
              <p className="font-bold text-foreground">
                {contratoCreado.moneda} {contratoCreado.montoAcordado?.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-border/50 bg-background shadow-md p-5 space-y-4">
          <h3 className="text-base font-bold text-foreground">1. Pago Inicial Programado</h3>
          <p className="text-xs text-muted-foreground">
            Elige tu método de pago preferido para la cuota inicial.
          </p>

          <div className="space-y-4">
            {pagos.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground py-4">
                Cargando información de pagos...
              </p>
            ) : (
              pagos.map((pago) => {
                const isPendiente = pago.estadoPago === "PENDIENTE"
                const isEnRevision = pago.estadoPago === "EN_REVISION"
                const isCompletado = pago.estadoPago === "COMPLETADO"

                return (
                  <div
                    key={pago.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/50 p-4 bg-muted/10"
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="capitalize">{pago.tipoPago.toLowerCase().replace("_", " ")}</span>
                      <span className="text-primary font-bold">
                        {pago.moneda} {pago.monto?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Vence: {pago.fechaVencimiento}
                      </div>
                      <Badge className={
                        isCompletado
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100"
                          : isEnRevision
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-100"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-100"
                      }>
                        {pago.estadoPago.replace("_", " ")}
                      </Badge>
                    </div>

                    {isPendiente && (
                      <div className="flex gap-2 pt-2 border-t border-border/30">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 h-10 font-semibold bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleStripePayment(pago.id)}
                          disabled={isGenerandoStripe}
                        >
                          <CreditCardIcon className="h-4 w-4" />
                          Tarjeta (Stripe)
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5 h-10 font-semibold"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubiendo}
                        >
                          <Upload01Icon className="h-4 w-4" />
                          Subir Comprobante
                        </Button>

                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, pago.id)}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>

        <Card className="border border-border/50 bg-background shadow-md p-5 space-y-4">
          <h3 className="text-base font-bold text-foreground">2. Firmar Contrato</h3>
          
          {!hasCompletedPayment ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 font-medium">
              ⚠️ Debes completar el pago inicial programado arriba para habilitar la firma digital de este contrato.
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800 font-medium">
              ✓ ¡Pago completado! Ya puedes proceder a firmar el contrato.
            </div>
          )}

          <Button
            className="w-full h-12 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
            disabled={!hasCompletedPayment || isFirmando}
            onClick={handleSignContract}
          >
            <SignatureIcon className="h-5 w-5" />
            {isFirmando ? "Firmando contrato..." : "Firmar Contrato Digitalmente"}
          </Button>
        </Card>
      </motion.div>
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
          <QuillWrite02Icon className="h-6 w-6 text-primary" />
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
      <Card className="overflow-hidden border-2 border-primary/10 bg-background shadow-lg">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          {publicacion.imagenes?.[0]?.urlImage && (
            <img
              src={publicacion.imagenes[0].urlImage}
              alt={publicacion.titulo}
              className="h-24 w-36 rounded-2xl object-cover shadow-md"
            />
          )}
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-bold">{publicacion.titulo}</h3>
            <p className="text-sm text-muted-foreground">
              {publicacion.inmueble.ubicacion?.zonaBarrios},{" "}
              {publicacion.inmueble.ubicacion?.ciudad}
            </p>
            <div className="flex gap-2">
              <Badge className="bg-primary px-3 py-1 text-xs font-bold hover:bg-primary">
                {publicacion.tipoTransaccion}
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                {moneda} {precioBase.toLocaleString()}{isRental ? "/mes" : ""}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column — Form */}
        <div className="space-y-6 lg:col-span-2">
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
                      onChange={(e) => {
                        setFechaInicio(e.target.value)
                        if (fechaFin && e.target.value > fechaFin) {
                          setFechaFin("")
                        }
                      }}
                      className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {(isRental || isAnticretico) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Fecha de fin
                      </label>
                      <input
                        type="date"
                        min={fechaInicio || todayStr}
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}
                </div>
                {isRental && nights > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2">
                    <Calendar03Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {nights} {nights === 1 ? "día" : "días"} de estancia
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Device Selection */}
          {showDevices && devices.length > 0 && (
            <Card className="overflow-hidden border border-border/50 shadow-sm">
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <CpuIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold">Dispositivos disponibles</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecciona los dispositivos que deseas incluir en tu contrato. El precio se calcula por día.
                </p>

                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      onClick={() => toggleDevice(device.id)}
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
                                  Hasta las {device.horarioLimiteUso}
                                </Badge>
                              )}
                            </div>
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
          )}

          {/* Conditions (read-only) */}
          {(publicacion.inmueble.condiciones ||
            publicacion.inmueble.multasSanciones) && (
            <Card className="overflow-hidden border border-border/50 shadow-sm">
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <AlertCircleIcon className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-bold">
                    Condiciones y restricciones
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estas condiciones fueron establecidas por el propietario y
                  quedarán registradas en el contrato.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {publicacion.inmueble.condiciones && (
                    <div className="rounded-xl border border-amber-200/50 bg-amber-50/30 p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                        Condiciones de uso
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {publicacion.inmueble.condiciones}
                      </p>
                    </div>
                  )}
                  {publicacion.inmueble.multasSanciones && (
                    <div className="rounded-xl border border-rose-200/50 bg-rose-50/30 p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                        Multas y sanciones
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {publicacion.inmueble.multasSanciones}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Observations */}
          <Card className="overflow-hidden border border-border/50 shadow-sm">
            <div className="space-y-3 p-5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Observaciones (opcional)
              </label>
              <textarea
                rows={3}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Agrega cualquier comentario o solicitud especial para el propietario..."
                className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Right Column — Price Summary */}
        <div className="lg:relative">
          <Card className="sticky top-24 overflow-hidden border-2 border-primary/10 bg-background shadow-xl">
            <div className="space-y-5 p-6">
              <h3 className="text-base font-bold">Resumen de la oferta</h3>

              <div className="space-y-3">
                {/* Base price */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Precio base{isRental && nights > 0 ? ` × ${nights} días` : ""}
                  </span>
                  <span className="font-semibold">
                    {moneda} {(isRental ? precioBase * nights : precioBase).toLocaleString()}
                  </span>
                </div>

                {/* Devices */}
                {showDevices && selectedDevices.length > 0 && (
                  <>
                    <Separator className="bg-border/50" />
                    {selectedDevices.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground truncate max-w-[160px]">
                          {d.nombre}
                          {isRental && nights > 0 ? ` × ${nights}d` : ""}
                        </span>
                        <span className="font-semibold">
                          {moneda}{" "}
                          {(d.precioPorDia * (isRental ? nights : 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <Separator className="bg-border/50" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-2xl font-black text-primary">
                    {moneda} {totalFinal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <Button
                size="lg"
                className="h-14 w-full gap-3 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                onClick={handleSubmit}
                disabled={
                  isCreating ||
                  (showDates && !fechaInicio) ||
                  (isRental && nights <= 0)
                }
              >
                <QuillWrite02Icon className="h-6 w-6" />
                {isCreating ? "Enviando oferta..." : "Confirmar Oferta"}
              </Button>

              <p className="text-center text-[10px] leading-tight font-medium tracking-widest text-muted-foreground uppercase">
                Al confirmar se creará un contrato que deberá ser pagado para activarse
              </p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
