import { useState } from "react"
import { useAppSelector } from "@/app/store"
import { useGetPaquetesQuery, useCrearSesionPagoMutation } from "../store/tokenApi"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Coins01Icon, Award01Icon, FlashIcon, CheckmarkCircle02Icon } from "hugeicons-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface CreditsPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogin: () => void
}

export function CreditsPurchaseModal({ isOpen, onClose, onOpenLogin }: CreditsPurchaseModalProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { data: paquetes, isLoading } = useGetPaquetesQuery(undefined, { skip: !isOpen })
  const [crearSesion, { isLoading: isRedirecting }] = useCrearSesionPagoMutation()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const handlePurchase = async (paqueteId: string) => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para poder comprar créditos")
      onClose()
      onOpenLogin()
      return
    }

    try {
      setSelectedPackageId(paqueteId)
      const res = await crearSesion({ paqueteId }).unwrap()
      toast.success("¡Sesión de Stripe creada! Redirigiendo...")
      // Redirigir a Stripe Checkout
      window.location.href = res.sessionUrl
    } catch (err: any) {
      logError(err)
      toast.error(err?.data?.error || "Error al conectar con la pasarela de Stripe")
      setSelectedPackageId(null)
    }
  }

  // Ayudante de depuración seguro
  const logError = (err: any) => {
    console.error("Stripe error:", err)
  }

  // Estilos de color premium personalizados según el paquete
  const getPackageStyles = (nombre: string) => {
    const lowercaseName = nombre.toLowerCase()
    if (lowercaseName.includes("oro") || lowercaseName.includes("gold") || lowercaseName.includes("mejor")) {
      return {
        cardClass: "border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.1)] hover:border-amber-500/50",
        badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        btnClass: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold",
        icon: <Award01Icon className="size-6 text-amber-400" />,
        glowColor: "rgba(245, 158, 11, 0.15)",
        badgeText: "MEJOR VALOR"
      }
    } else if (lowercaseName.includes("plata") || lowercaseName.includes("silver") || lowercaseName.includes("popular")) {
      return {
        cardClass: "border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:border-blue-500/50",
        badgeClass: "bg-blue-500/10 text-blue-300 border-blue-500/20",
        btnClass: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold",
        icon: <FlashIcon className="size-6 text-blue-400" />,
        glowColor: "rgba(59, 130, 246, 0.15)",
        badgeText: "MÁS POPULAR"
      }
    } else {
      return {
        cardClass: "border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-slate-500",
        badgeClass: "bg-slate-500/10 text-slate-300 border-slate-700/50",
        btnClass: "bg-slate-800 hover:bg-slate-700 text-white font-semibold",
        icon: <Coins01Icon className="size-6 text-slate-400" />,
        glowColor: "rgba(100, 116, 139, 0.05)",
        badgeText: "BÁSICO"
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] border-slate-800 bg-slate-950 p-6 text-white shadow-2xl md:p-8 flex flex-col">
        <DialogHeader className="space-y-2 text-center shrink-0">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Coins01Icon className="size-7 animate-pulse text-amber-300" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight md:text-3xl">
            Adquiere Tokens de SpaceShift
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Potencia tus publicaciones con modelado y procesamiento de IA en 3D.
            ¡Elige el paquete que mejor se adapte a tus necesidades!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto flex-1 px-2 py-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-[320px] animate-pulse flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-6"
                >
                  <div className="space-y-4">
                    <div className="h-6 w-24 rounded bg-slate-800" />
                    <div className="h-10 w-36 rounded bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-slate-800" />
                      <div className="h-4 w-5/6 rounded bg-slate-800" />
                    </div>
                  </div>
                  <div className="h-10 w-full rounded bg-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AnimatePresence>
                {paquetes?.map((paquete, index) => {
                  const styles = getPackageStyles(paquete.nombrePaquete)
                  const isPurchasingCurrent = isRedirecting && selectedPackageId === paquete.id

                  return (
                    <motion.div
                      key={paquete.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className={`relative flex flex-col justify-between rounded-xl border p-6 transition-all duration-300 ${styles.cardClass}`}
                    >
                      {styles.badgeText && (
                        <span className={`absolute -top-3 right-4 rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${styles.badgeClass}`}>
                          {styles.badgeText}
                        </span>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-400">
                            {paquete.nombrePaquete}
                          </span>
                          {styles.icon}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-3xl font-extrabold tracking-tight text-white">
                            {paquete.creditosPaquetes.toLocaleString()}
                            <span className="ml-1 text-sm font-semibold text-blue-300">SST</span>
                          </h4>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-amber-300">
                              {paquete.precio.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-slate-400">Bs. (BOB)</span>
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-400">
                          {paquete.descripcion || "Recarga créditos de forma inmediata para tus conversiones 3D."}
                        </p>

                        <ul className="space-y-2 pt-2 text-[10px] text-slate-300">
                          <li className="flex items-center gap-1.5">
                            <CheckmarkCircle02Icon className="size-3.5 text-emerald-400 shrink-0" />
                            Acreditación instantánea
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckmarkCircle02Icon className="size-3.5 text-emerald-400 shrink-0" />
                            Garantía de reembolso por error
                          </li>
                          <li className="flex items-center gap-1.5">
                            <CheckmarkCircle02Icon className="size-3.5 text-emerald-400 shrink-0" />
                            Procesamiento de IA priorizado
                          </li>
                        </ul>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800/60">
                        <Button
                          onClick={() => handlePurchase(paquete.id)}
                          disabled={isRedirecting}
                          className={`w-full py-5 rounded-lg active:scale-95 transition-all ${styles.btnClass}`}
                        >
                          {isPurchasingCurrent ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                              <span>Redirigiendo...</span>
                            </div>
                          ) : (
                            "Comprar ahora"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
