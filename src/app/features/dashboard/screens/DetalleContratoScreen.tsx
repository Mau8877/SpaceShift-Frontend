import * as React from "react"
import { useParams, useNavigate, Link } from "@tanstack/react-router"
import { useAppSelector } from "@/app/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useGetContratoPorIdQuery,
  useGetPagosDeContratoQuery,
  useFirmarContratoMutation,
  useSubirComprobantePagoMutation,
  useAprobarPagoManualMutation,
  useRegistrarPagoEfectivoMutation,
  useGenerarSesionPagoStripeMutation,
  useEliminarContratoMutation,
  useCancelarContratoMutation,
} from "../store/contratoApi"
import { toast } from "sonner"
import {
  SignatureIcon,
  CreditCardIcon,
  Upload01Icon,
  CheckmarkCircle02Icon,
  Cash01Icon,
  AttachmentIcon,
  ArrowLeft01Icon,
  Delete02Icon,
} from "hugeicons-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DetalleContratoScreen() {
  const { id } = useParams({ from: "/_auth/dashboard/contratos/$id" })
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const { data: contrato, isLoading: isLoadingContract } = useGetContratoPorIdQuery(
    id || "",
    { skip: !id }
  )

  const { data: pagos = [], isLoading: isLoadingPagos } = useGetPagosDeContratoQuery(
    id || "",
    { skip: !id }
  )

  const [firmar, { isLoading: isFirmando }] = useFirmarContratoMutation()
  const [subirComprobante, { isLoading: isSubiendo }] = useSubirComprobantePagoMutation()
  const [aprobarPago, { isLoading: isAprobando }] = useAprobarPagoManualMutation()
  const [registrarEfectivo, { isLoading: isRegistrandoEfectivo }] = useRegistrarPagoEfectivoMutation()
  const [generarStripe, { isLoading: isGenerandoStripe }] = useGenerarSesionPagoStripeMutation()
  const [eliminarContrato, { isLoading: isEliminando }] = useEliminarContratoMutation()
  const [cancelarContrato, { isLoading: isCancelando }] = useCancelarContratoMutation()

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  // Selección de dispositivos
  const customSpecs = React.useMemo(() => {
    if (!contrato?.especificaciones) return {}
    const filtered: Record<string, any> = {}
    for (const [k, v] of Object.entries(contrato.especificaciones)) {
      if (
        k !== "dispositivos_alquilados" &&
        k !== "precio_dispositivos_total" &&
        k !== "dispositivosContrato" &&
        k !== "reglasContrato" &&
        k !== "sancionesContrato" &&
        k !== "contenidoContratoHash"
      ) {
        filtered[k] = v
      }
    }
    return filtered
  }, [contrato])

  const reglasContrato = contrato?.especificaciones?.reglasContrato
  const sancionesContrato = contrato?.especificaciones?.sancionesContrato
  const dispositivosDelContrato =
    contrato?.especificaciones?.dispositivosContrato ||
    contrato?.especificaciones?.dispositivos_alquilados ||
    []

  // Roles
  const isOwner = contrato && (user?.id === contrato.idPropietario || user?.id === contrato.propietarioId)
  const isClient = contrato && (user?.id === contrato.idCliente || user?.id === contrato.clienteId)

  const handleSign = async () => {
    if (!id) return
    try {
      toast.info("Firmando contrato...", {
        description: "Registrando firma en base de datos y en libro mayor inmutable (Blockchain).",
      })
      await firmar({ id }).unwrap()
      toast.success("Contrato firmado correctamente", {
        description: "El contrato se ha activado y registrado en la Blockchain con éxito.",
      })
    } catch (error: any) {
      toast.error("Error al firmar", {
        description: error?.data?.message || "No se pudo firmar el contrato.",
      })
    }
  }

  const handleStripePayment = async (pagoId: string) => {
    try {
      const res = await generarStripe(pagoId).unwrap()
      if (res.stripeCheckoutUrl) {
        toast.info("Redirigiendo a Stripe...", {
          description: "Por favor completa tu pago de forma segura.",
        })
        window.location.href = res.stripeCheckoutUrl
      }
    } catch (error: any) {
      toast.error("Error al iniciar pago", {
        description: error?.data?.message || "No se pudo generar la sesión de Stripe.",
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
    } catch (error: any) {
      toast.error("Error al subir archivo", {
        description: error?.data?.message || "No se pudo cargar el comprobante.",
      })
    }
  }

  const handleApprovePayment = async (pagoId: string) => {
    try {
      await aprobarPago(pagoId).unwrap()
      toast.success("Pago aprobado", {
        description: "La transacción ha sido registrada como completada.",
      })
    } catch (error: any) {
      toast.error("Error al aprobar pago", {
        description: error?.data?.message || "No se pudo aprobar la transacción.",
      })
    }
  }

  const handleCashPayment = async (pagoId: string) => {
    try {
      await registrarEfectivo(pagoId).unwrap()
      toast.success("Pago en efectivo registrado", {
        description: "Se ha marcado la cuota como pagada directamente.",
      })
    } catch (error: any) {
      toast.error("Error al registrar efectivo", {
        description: error?.data?.message || "No se pudo guardar el cobro.",
      })
    }
  }

  const handleDeleteContract = async () => {
    if (!id) return
    try {
      await eliminarContrato(id).unwrap()
      toast.success("Contrato eliminado", {
        description: "El contrato y su plan de pagos se han eliminado de la base de datos.",
      })
      navigate({ to: "/dashboard/contratos" })
    } catch (error: any) {
      toast.error("Error al eliminar", {
        description: error?.data?.message || "No se pudo eliminar el contrato.",
      })
    }
  }

  const handleCancelContract = async () => {
    if (!id) return
    try {
      await cancelarContrato(id).unwrap()
      toast.success("Contrato cancelado", {
        description: "El contrato ha sido cancelado correctamente.",
      })
    } catch (error: any) {
      toast.error("Error al cancelar", {
        description: error?.data?.message || "No se pudo cancelar el contrato.",
      })
    }
  }

  const formatCurrency = (amount?: number, currency?: string) => {
    const safeAmount = amount ?? 0
    const safeCurrency = currency ?? ""
    return `${safeCurrency} ${safeAmount.toLocaleString("es-BO")}`
  }

  if (isLoadingContract) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-900 border-t-transparent"></div>
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-medium">Contrato no encontrado.</p>
        <Link to="/dashboard/contratos" className="mt-4 inline-block">
          <Button variant="outline">Volver a la lista</Button>
        </Link>
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Botones de acción superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/dashboard/contratos">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft01Icon className="h-5 w-5" />
            <span>Volver a Contratos</span>
          </Button>
        </Link>

        {isOwner && contrato.estadoContrato === "PENDIENTE_FIRMA" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 rounded-xl font-bold px-4 h-10 shadow-sm"
                disabled={isEliminando}
              >
                <Delete02Icon className="h-5 w-5" />
                <span>Eliminar Contrato</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white rounded-3xl border border-slate-200 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold text-slate-950 font-heading">
                  ¿Estás seguro de eliminar este contrato?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 text-sm">
                  Esta acción es irreversible. Se eliminará permanentemente el contrato {contrato.codigo} y todo su cronograma de pagos asociado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl font-bold border-slate-200">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteContract}
                  className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirmar Eliminación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isOwner && contrato.estadoContrato === "VIGENTE" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 rounded-xl font-bold px-4 h-10 shadow-sm bg-amber-600 hover:bg-amber-700 border border-amber-700/10 text-white"
                disabled={isCancelando}
              >
                <Delete02Icon className="h-5 w-5" />
                <span>Cancelar Contrato</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white rounded-3xl border border-slate-200 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold text-slate-950 font-heading">
                  ¿Estás seguro de cancelar este contrato vigente?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 text-sm">
                  Esta acción cancelará el contrato vigente {contrato.codigo}. El estado del contrato cambiará a CANCELADO.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl font-bold border-slate-200">
                  Volver
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelContract}
                  className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Confirmar Cancelación
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Contrato {contrato.codigo}
            </h2>
            <Badge variant="outline" className="capitalize text-xs">
              {contrato.tipoContrato.toLowerCase()}
            </Badge>
          </div>
          <Badge className={
            contrato.estadoContrato === "VIGENTE" 
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 text-sm font-semibold rounded-full px-3 py-1" 
              : contrato.estadoContrato === "PENDIENTE_FIRMA"
              ? "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 text-sm font-semibold rounded-full px-3 py-1"
              : contrato.estadoContrato === "FINALIZADO"
              ? "bg-slate-50 text-slate-600 hover:bg-slate-50 border border-slate-200 text-sm font-semibold rounded-full px-3 py-1"
              : "bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200 text-sm font-semibold rounded-full px-3 py-1"
          }>
            {contrato.estadoContrato.replace("_", " ")}
          </Badge>
        </div>

        <p className="text-sm text-slate-500">
          Asociado al inmueble: <span className="font-semibold text-slate-700">{contrato.inmuebleTitulo}</span>
        </p>

        <Separator className="my-6 bg-slate-100" />

        {/* Resumen Detallado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Propietario</p>
              <p className="text-slate-800 text-base font-semibold mt-0.5">{contrato.propietarioNombre}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente (Inquilino/Comprador)</p>
              <p className="text-slate-800 text-base font-semibold mt-0.5">{contrato.clienteNombre}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vigencia del Contrato</p>
              <p className="text-slate-800 text-base font-semibold mt-0.5">
                Desde: <span className="text-indigo-600">{contrato.fechaInicio || "No especificado"}</span> 
                {contrato.fechaFin ? ` hasta: ` : ""}
                {contrato.fechaFin && <span className="text-indigo-600">{contrato.fechaFin}</span>}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto Financiero</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {formatCurrency(contrato.monto, contrato.moneda)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Renovación Automática</p>
              <p className="text-slate-800 text-base font-semibold mt-0.5">
                {contrato.renovacionAutomatica ? "Sí, activa" : "No"}
              </p>
            </div>

            {contrato.transactionHash && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-3 mt-2">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Registro Blockchain</p>
                <p className="text-xs text-indigo-950 font-mono mt-1 break-all select-all">
                  Hash: {contrato.transactionHash}
                </p>
                {contrato.especificaciones?.contenidoContratoHash && (
                  <p className="text-xs text-indigo-950 font-mono mt-1 break-all select-all">
                    Contenido firmado: {contrato.especificaciones.contenidoContratoHash}
                  </p>
                )}
              </div>
            )}

            {/* Condiciones y Multas del Contrato (Para firmar) */}
            {contrato.estadoContrato === "PENDIENTE_FIRMA" && (reglasContrato || sancionesContrato) && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 mt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reglas y Sanciones del Contrato
                </h4>
                {reglasContrato && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condiciones / Reglas</p>
                    <p className="text-slate-700 text-xs mt-1 whitespace-pre-line">{reglasContrato}</p>
                  </div>
                )}
                {sancionesContrato && (
                  <div className="pt-2 border-t border-slate-200/50">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Multas y Sanciones por Incumplimiento</p>
                    <p className="text-slate-700 text-xs mt-1 whitespace-pre-line">{sancionesContrato}</p>
                  </div>
                )}
              </div>
            )}

            {/* Botón de Firma para Cliente o Propietario */}
            {contrato.estadoContrato === "PENDIENTE_FIRMA" && (isClient || isOwner) && (
              <div className="pt-2">
                <Button 
                  onClick={handleSign} 
                  disabled={isFirmando}
                  className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md h-11"
                >
                  <SignatureIcon className="h-5 w-5" />
                  {isFirmando ? "Firmando contrato..." : "Firmar Contrato Digitalmente"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dispositivos Incluidos en el Contrato */}
        {dispositivosDelContrato.length > 0 && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dispositivos Incluidos en el Contrato
            </h4>
            <div className="space-y-2">
              {(dispositivosDelContrato as any[]).map((dev: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{dev.nombre}</p>
                    <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                      {dev.cantidad ? <p>Cantidad: {dev.cantidad}</p> : null}
                      {(dev.fechaInicioUso || dev.fechaFinUso) ? (
                        <p>Uso: {dev.fechaInicioUso || "Sin inicio"} - {dev.fechaFinUso || "Sin fin"}</p>
                      ) : dev.diasUso ? (
                        <p>Tiempo de uso: {dev.diasUso} dias</p>
                      ) : null}
                      {(dev.horaInicioUso || dev.horaFinUso) ? (
                        <p>Horario: {dev.horaInicioUso || "--:--"} - {dev.horaFinUso || "--:--"}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="font-bold text-indigo-600">
                    {contrato.moneda} {Number(dev.precioContrato || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Condiciones y Multas del Contrato */}
        {contrato.estadoContrato === "VIGENTE" && (reglasContrato || sancionesContrato) && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reglas y Sanciones Registradas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {reglasContrato && (
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condiciones / Reglas</p>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{reglasContrato}</p>
                </div>
              )}
              {sancionesContrato && (
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Multas y Sanciones</p>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{sancionesContrato}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cláusulas / Especificaciones JSONB */}
        {contrato.especificaciones && Object.keys(customSpecs).length > 0 && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-5 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Cláusulas y Especificaciones Personalizadas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {Object.entries(customSpecs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                  <span className="font-semibold text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-bold text-slate-800">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-8 bg-slate-100" />

        {/* Agenda de Pagos */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-950 font-heading">Cronograma de Pagos</h3>
          {isLoadingPagos ? (
            <div className="text-center py-12 text-sm text-slate-500">Cargando cronograma...</div>
          ) : pagos.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-slate-200 rounded-2xl">
              No se encontraron cuotas programadas.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-100">
                    <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Concepto</TableHead>
                    <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Monto</TableHead>
                    <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Vencimiento</TableHead>
                    <TableHead className="text-slate-500 font-bold text-xs uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="text-right text-slate-500 font-bold text-xs uppercase tracking-wider">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.map((pago) => {
                    const isPendiente = pago.estadoPago === "PENDIENTE"
                    const isEnRevision = pago.estadoPago === "EN_REVISION"
                    const isCompletado = pago.estadoPago === "COMPLETADO"

                    return (
                      <TableRow key={pago.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-800">
                          {pago.tipoPago.replace("_", " ")}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {formatCurrency(pago.monto, pago.moneda)}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {pago.fechaVencimiento}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            isCompletado 
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 font-semibold rounded-full" 
                              : isEnRevision
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-100 font-semibold rounded-full"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-100 font-semibold rounded-full"
                          }>
                            {pago.estadoPago.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2 flex-wrap">
                            {/* Botones para el Inquilino/Cliente */}
                            {isClient && isPendiente && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8.5 gap-1.5 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl"
                                  onClick={() => handleStripePayment(pago.id)}
                                  disabled={isGenerandoStripe}
                                >
                                  <CreditCardIcon className="h-4 w-4" />
                                  Tarjeta (Stripe)
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8.5 gap-1.5 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl"
                                  onClick={() => fileInputRefs.current[pago.id]?.click()}
                                  disabled={isSubiendo}
                                >
                                  <Upload01Icon className="h-4 w-4" />
                                  Transferir
                                </Button>

                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  ref={(el) => {
                                    fileInputRefs.current[pago.id] = el
                                  }}
                                  onChange={(e) => handleFileChange(e, pago.id)}
                                />
                              </>
                            )}

                            {/* Botones para el Propietario */}
                            {isOwner && isPendiente && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8.5 gap-1.5 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl"
                                onClick={() => handleCashPayment(pago.id)}
                                disabled={isRegistrandoEfectivo}
                              >
                                <Cash01Icon className="h-4 w-4" />
                                Cobrar Efectivo
                              </Button>
                            )}

                            {isOwner && isEnRevision && (
                              <>
                                {pago.documentoComprobanteUrl && (
                                  <a 
                                    href={pago.documentoComprobanteUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl font-bold transition-colors"
                                  >
                                    <AttachmentIcon className="h-3.5 w-3.5" />
                                    Ver Voucher
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  className="h-8.5 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                  onClick={() => handleApprovePayment(pago.id)}
                                  disabled={isAprobando}
                                >
                                  <CheckmarkCircle02Icon className="h-4 w-4" />
                                  Aprobar Pago
                                </Button>
                              </>
                            )}

                            {isCompletado && (
                              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                <CheckmarkCircle02Icon className="h-4 w-4 text-emerald-500" />
                                {pago.metodoPago?.toLowerCase()} ({pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : ""})
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
