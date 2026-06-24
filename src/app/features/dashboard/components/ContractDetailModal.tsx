import * as React from "react"
import { useAppSelector } from "@/app/store"
import { useChatSocket } from "@/hooks/useChatSocket"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  useDescargarReciboPagoMutation,
} from "../store/contratoApi"
import { toast } from "sonner"
import { 
  SignatureIcon, 
  CreditCardIcon, 
  Upload01Icon, 
  CheckmarkCircle02Icon, 
  Cash01Icon,
  AttachmentIcon,
  FileAttachmentIcon,
  Download01Icon
} from "hugeicons-react"

interface ContractDetailModalProps {
  contractId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ContractDetailModal({
  contractId,
  isOpen,
  onClose,
}: ContractDetailModalProps) {
  const { user } = useAppSelector((state) => state.auth)

  const { data: contrato, isLoading: isLoadingContract } = useGetContratoPorIdQuery(
    contractId || "",
    { skip: !contractId }
  )

  const { data: pagos = [], isLoading: isLoadingPagos, refetch: refetchPagos } = useGetPagosDeContratoQuery(
    contractId || "",
    { skip: !contractId }
  )

  const [firmar, { isLoading: isFirmando }] = useFirmarContratoMutation()
  const [subirComprobante, { isLoading: isSubiendo }] = useSubirComprobantePagoMutation()
  const [aprobarPago, { isLoading: isAprobando }] = useAprobarPagoManualMutation()
  const [registrarEfectivo, { isLoading: isRegistrandoEfectivo }] = useRegistrarPagoEfectivoMutation()
  const [generarStripe, { isLoading: isGenerandoStripe }] = useGenerarSesionPagoStripeMutation()
  const [descargarRecibo, { isLoading: isDescargandoRecibo }] = useDescargarReciboPagoMutation()

  const handleDescargarRecibo = async (pagoId: string) => {
    try {
      const blob = await descargarRecibo(pagoId).unwrap()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Recibo_Pago_${pagoId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Recibo descargado correctamente")
    } catch (error: any) {
      toast.error("Error al descargar recibo", {
        description: error?.data?.message || "No se pudo obtener el PDF.",
      })
    }
  }

  useChatSocket({
    onMessageReceived: (message) => {
      console.log("[DEBUG - ContractDetailModal] Mensaje WebSocket recibido:", message)
      if (message.type === "PAYMENT_APPROVED" && message.contratoId === contractId) {
        toast.success("¡Pago confirmado en tiempo real por WebSockets!")
        refetchPagos()
      }
    },
    enabled: !!contractId,
  })

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  // Roles
  const isOwner = contrato && (user?.id === contrato.idPropietario || user?.id === contrato.propietarioId)
  const isClient = contrato && (user?.id === contrato.idCliente || user?.id === contrato.clienteId)

  const handleSign = async () => {
    if (!contractId) return
    try {
      await firmar({ id: contractId }).unwrap()
      toast.success("Contrato firmado correctamente", {
        description: "El contrato ahora se encuentra activo.",
      })
    } catch (error: any) {
      toast.error("Error al firmar", {
        description: error?.data?.message || "No se pudo firmar el contrato.",
      })
    }
  }

  const handleStripePayment = async (pagoId: string) => {
    try {
      const originUrl = window.location.origin
      console.log("[DEBUG - ContractDetailModal] Solicitando pago de Stripe:", {
        pagoId,
        originUrl,
      })
      const res = await generarStripe({ pagoId, originUrl }).unwrap()
      console.log("[DEBUG - ContractDetailModal] Respuesta de Stripe recibida:", res)
      if (res.stripeCheckoutUrl) {
        toast.info("Abriendo pasarela de pago Stripe en una nueva pestaña...", {
          description: "Por favor completa tu pago de forma segura.",
        })
        window.open(res.stripeCheckoutUrl, "_blank")
      }
    } catch (error: any) {
      console.error("[DEBUG - ContractDetailModal] Error en handleStripePayment:", error)
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

  const formatCurrency = (amount?: number, currency?: string) => {
    const safeAmount = amount ?? 0
    const safeCurrency = currency ?? ""
    return `${safeCurrency} ${safeAmount.toLocaleString("es-BO")}`
  }

  if (!contractId || !contrato) return null

  const reglasContrato = contrato.especificaciones?.reglasContrato
  const sancionesContrato = contrato.especificaciones?.sancionesContrato
  const dispositivosDelContrato =
    contrato.especificaciones?.dispositivosContrato ||
    contrato.especificaciones?.dispositivos_alquilados ||
    []
  const customSpecs = Object.entries(contrato.especificaciones || {}).filter(
    ([key]) =>
      key !== "dispositivos_alquilados" &&
      key !== "precio_dispositivos_total" &&
      key !== "dispositivosContrato" &&
      key !== "reglasContrato" &&
      key !== "sancionesContrato" &&
      key !== "contenidoContratoHash"
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Contrato {contrato.codigo}</span>
              <Badge variant="outline" className="capitalize text-xs">
                {contrato.tipoContrato.toLowerCase()}
              </Badge>
            </DialogTitle>
            <Badge className={
              contrato.estadoContrato === "VIGENTE" 
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200" 
                : contrato.estadoContrato === "PENDIENTE_FIRMA"
                ? "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200"
                : contrato.estadoContrato === "FINALIZADO"
                ? "bg-slate-50 text-slate-600 hover:bg-slate-50 border border-slate-200"
                : "bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200"
            }>
              {contrato.estadoContrato.replace("_", " ")}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            Asociado al inmueble: <span className="font-semibold text-slate-700">{contrato.inmuebleTitulo}</span>
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4 bg-slate-100" />

        {/* Resumen Detallado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Propietario</p>
              <p className="text-slate-800 font-medium">{contrato.propietarioNombre}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente (Inquilino/Comprador)</p>
              <p className="text-slate-800 font-medium">{contrato.clienteNombre}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vigencia del Contrato</p>
              <p className="text-slate-800">
                Desde: <span className="font-semibold">{contrato.fechaInicio}</span> 
                {contrato.fechaFin ? ` hasta: ` : ""}
                {contrato.fechaFin && <span className="font-semibold">{contrato.fechaFin}</span>}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto Financiero</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(contrato.monto, contrato.moneda)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Renovación Automática</p>
              <p className="text-slate-800">{contrato.renovacionAutomatica ? "Sí, activa" : "No"}</p>
            </div>

          </div>
        </div>

        {(reglasContrato || sancionesContrato || dispositivosDelContrato.length > 0) && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Reglas, sanciones y dispositivos del contrato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {reglasContrato && (
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condiciones / Reglas</p>
                  <p className="text-slate-700 whitespace-pre-line">{reglasContrato}</p>
                </div>
              )}
              {sancionesContrato && (
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Multas y Sanciones</p>
                  <p className="text-slate-700 whitespace-pre-line">{sancionesContrato}</p>
                </div>
              )}
            </div>

            {dispositivosDelContrato.length > 0 && (
              <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                  Dispositivos incluidos
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {dispositivosDelContrato.map((device: any) => (
                    <div key={device.id || device.nombre} className="rounded-lg bg-indigo-50/50 px-3 py-2 text-xs text-slate-700">
                      <p className="font-bold text-slate-900">{device.nombre}</p>
                      <p>{contrato.moneda} {Number(device.precioContrato || 0).toLocaleString("es-BO")}</p>
                      {device.cantidad ? <p>Cantidad: {device.cantidad}</p> : null}
                      {(device.fechaInicioUso || device.fechaFinUso) ? (
                        <p>Uso: {device.fechaInicioUso || "Sin inicio"} - {device.fechaFinUso || "Sin fin"}</p>
                      ) : null}
                      {(device.horaInicioUso || device.horaFinUso) ? (
                        <p>Horario: {device.horaInicioUso || "--:--"} - {device.horaFinUso || "--:--"}</p>
                      ) : null}
                      {device.sancionIncumplimiento ? (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          Sanción: {device.sancionIncumplimiento}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado de Firmas Tracker (Para VENTA) */}
        {contrato.estadoContrato === "PENDIENTE_FIRMA" && contrato.tipoContrato === "VENTA" && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 mt-4 space-y-2 text-sm">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estado de Firmas del Contrato de Venta:
            </h5>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Comprador (Cliente):</span>
                {contrato.especificaciones?.firmaCliente ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Firmado</span>
                ) : (
                  <span className="text-amber-600 font-bold flex items-center gap-1">⏳ Pendiente</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Vendedor (Propietario):</span>
                {contrato.especificaciones?.firmaPropietario ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Firmado</span>
                ) : (
                  <span className="text-amber-600 font-bold flex items-center gap-1">⏳ Pendiente</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón de Firma para Cliente o Propietario */}
        {contrato.estadoContrato === "PENDIENTE_FIRMA" && (() => {
          const clientSigned = !!contrato.especificaciones?.firmaCliente
          const ownerSigned = !!contrato.especificaciones?.firmaPropietario
          
          const isVenta = contrato.tipoContrato === "VENTA"
          const userCanSign = isVenta 
            ? (isClient && !clientSigned) || (isOwner && !ownerSigned)
            : (isClient && !clientSigned)

          if (!userCanSign) {
            if (isVenta && clientSigned && !ownerSigned && isClient) {
              return <p className="text-xs font-medium text-slate-500 mt-4 italic">Esperando que el propietario firme el contrato.</p>
            }
            if (isVenta && ownerSigned && !clientSigned && isOwner) {
              return <p className="text-xs font-medium text-slate-500 mt-4 italic">Esperando que el comprador (cliente) firme el contrato.</p>
            }
            if (!isVenta && isOwner) {
              return <p className="text-xs font-medium text-slate-500 mt-4 italic">Esperando que el cliente firme el contrato.</p>
            }
            return null
          }

          return (
            <div className="mt-5 space-y-3">
              {!pagos.some((p: any) => p.estadoPago === "COMPLETADO") && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 font-medium">
                  ⚠️ Debe realizar el pago inicial (usando Stripe o registrando su transferencia) antes de poder firmar digitalmente el contrato.
                </div>
              )}
              <Button 
                onClick={() => {
                  if (!pagos.some((p: any) => p.estadoPago === "COMPLETADO")) {
                    toast.error("Pago requerido", {
                      description: "Debes completar el pago inicial de la cuota programada antes de firmar.",
                    })
                    return
                  }
                  handleSign()
                }} 
                disabled={isFirmando}
                className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <SignatureIcon className="h-5 w-5" />
                {isFirmando ? "Firmando contrato..." : "Firmar Contrato Digitalmente"}
              </Button>
            </div>
          )
        })()}

        {/* Cláusulas / Especificaciones JSONB */}
        {customSpecs.length > 0 && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Cláusulas y Especificaciones Personalizadas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {customSpecs.map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-100">
                  <span className="font-medium text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-bold text-slate-800">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6 bg-slate-100" />

        {/* Agenda de Pagos */}
        <div>
          <h3 className="text-base font-bold text-slate-950 mb-3">Cronograma de Pagos</h3>
          {isLoadingPagos ? (
            <div className="text-center py-6 text-sm text-slate-500">Cargando cronograma...</div>
          ) : pagos.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">No se encontraron cuotas programadas.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-500 font-semibold">Concepto</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Monto</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Vencimiento</TableHead>
                  <TableHead className="text-slate-500 font-semibold">Estado</TableHead>
                  <TableHead className="text-right text-slate-500 font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => {
                  const isPendiente = pago.estadoPago === "PENDIENTE"
                  const isEnRevision = pago.estadoPago === "EN_REVISION"
                  const isCompletado = pago.estadoPago === "COMPLETADO"

                  return (
                    <TableRow key={pago.id} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-800">
                        {pago.tipoPago.replace("_", " ")}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {formatCurrency(pago.monto, pago.moneda)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {pago.fechaVencimiento}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          isCompletado 
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100" 
                            : isEnRevision
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-100"
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
                                className="h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                                onClick={() => handleStripePayment(pago.id)}
                                disabled={isGenerandoStripe}
                              >
                                <CreditCardIcon className="h-4 w-4" />
                                Tarjeta (Stripe)
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
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
                              className="h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
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
                                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                                >
                                  <AttachmentIcon className="h-3.5 w-3.5" />
                                  Ver Voucher
                                </a>
                              )}
                              <Button
                                size="sm"
                                className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleApprovePayment(pago.id)}
                                disabled={isAprobando}
                              >
                                <CheckmarkCircle02Icon className="h-4 w-4" />
                                Aprobar Pago
                              </Button>
                            </>
                          )}

                          {isCompletado && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                <CheckmarkCircle02Icon className="h-4 w-4 text-emerald-500" />
                                {pago.metodoPago?.toLowerCase()} ({pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : ""})
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold"
                                onClick={() => handleDescargarRecibo(pago.id)}
                                disabled={isDescargandoRecibo}
                              >
                                <Download01Icon className="h-3 w-3" />
                                Recibo
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
