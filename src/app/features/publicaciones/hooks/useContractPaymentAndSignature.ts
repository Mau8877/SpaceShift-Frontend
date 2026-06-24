import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useChatSocket } from "@/hooks/useChatSocket"
import {
  useGetPagosDeContratoQuery,
  useGenerarSesionPagoStripeMutation,
  useSubirComprobantePagoMutation,
  useFirmarContratoMutation,
} from "../../dashboard/store/contratoApi"
import { toast } from "sonner"

interface UseContractPaymentAndSignatureProps {
  contratoCreado: any
}

export function useContractPaymentAndSignature({
  contratoCreado,
}: UseContractPaymentAndSignatureProps) {
  const navigate = useNavigate()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const { data: pagos = [], refetch: refetchPagos } = useGetPagosDeContratoQuery(
    contratoCreado?.id || "",
    { skip: !contratoCreado?.id }
  )

  const [subirComprobante, { isLoading: isSubiendo }] = useSubirComprobantePagoMutation()
  const [generarStripe, { isLoading: isGenerandoStripe }] = useGenerarSesionPagoStripeMutation()
  const [firmar, { isLoading: isFirmando }] = useFirmarContratoMutation()

  useChatSocket({
    onMessageReceived: (message) => {
      console.log("[DEBUG - ContractPaymentAndSignature] Mensaje recibido por WebSocket:", message)
      if (message.type === "PAYMENT_APPROVED" && message.contratoId === contratoCreado?.id) {
        toast.success("¡Pago confirmado en tiempo real!")
        refetchPagos()
      }
    },
    enabled: !!contratoCreado?.id,
  })

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
      console.log("[DEBUG - ContractPaymentAndSignature] Solicitando pago de Stripe:", {
        pagoId,
        originUrl,
      })
      const res = await generarStripe({ pagoId, originUrl }).unwrap()
      console.log("[DEBUG - ContractPaymentAndSignature] Respuesta de Stripe recibida:", res)
      if (res.stripeCheckoutUrl) {
        toast.info("Abriendo pasarela de pago Stripe en una nueva pestaña...")
        window.open(res.stripeCheckoutUrl, "_blank")
      }
    } catch (err: any) {
      console.error("[DEBUG - ContractPaymentAndSignature] Error en handleStripePayment:", err)
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

  const hasCompletedPayment = pagos.some((p) => p.estadoPago === "COMPLETADO")

  return {
    pagos,
    isSubiendo,
    isGenerandoStripe,
    isFirmando,
    hasCompletedPayment,
    fileInputRef,
    handleFileChange,
    handleStripePayment,
    handleSignContract,
  }
}
