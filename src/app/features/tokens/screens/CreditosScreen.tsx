import { useState } from "react"
import { useAppSelector } from "@/app/store"
import { useGetPaquetesQuery, useCrearSesionPagoMutation } from "../store/tokenApi"
import { Button } from "@/components/ui/button"
import { Coins01Icon, Award01Icon, FlashIcon, CheckmarkCircle02Icon, ArrowLeft02Icon } from "hugeicons-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function CreditosScreen() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { data: paquetes, isLoading } = useGetPaquetesQuery()
  const [crearSesion, { isLoading: isRedirecting }] = useCrearSesionPagoMutation()
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const handlePurchase = async (paqueteId: string) => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para poder comprar créditos")
      // Redirigir a la misma página agregando ?login=true para que el Header levante el LoginModal
      navigate({ to: "/creditos", search: { login: "true" } })
      return
    }

    try {
      setSelectedPackageId(paqueteId)
      const res = await crearSesion({ paqueteId }).unwrap()
      toast.success("¡Sesión de Stripe creada! Redirigiendo...")
      window.location.href = res.sessionUrl
    } catch (err: any) {
      logError(err)
      toast.error(err?.data?.error || "Error al conectar con la pasarela de Stripe")
      setSelectedPackageId(null)
    }
  }

  const logError = (err: any) => {
    console.error("Stripe error:", err)
  }

  // Estilos de color personalizados según el paquete en modo claro (Light SaaS)
  const getPackageStyles = (nombre: string) => {
    const lowercaseName = nombre.toLowerCase()
    if (lowercaseName.includes("oro") || lowercaseName.includes("gold") || lowercaseName.includes("mejor")) {
      return {
        cardClass: "border-amber-200 bg-white hover:border-amber-400 hover:shadow-md",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Award01Icon className="size-6 text-amber-500" />,
        badgeText: "MEJOR VALOR"
      }
    } else if (lowercaseName.includes("plata") || lowercaseName.includes("silver") || lowercaseName.includes("popular")) {
      return {
        cardClass: "border-blue-200 bg-white hover:border-blue-400 hover:shadow-md",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <FlashIcon className="size-6 text-blue-500" />,
        badgeText: "MÁS POPULAR"
      }
    } else {
      return {
        cardClass: "border-slate-200 bg-white hover:border-slate-350 hover:shadow-md",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <Coins01Icon className="size-6 text-slate-500" />,
        badgeText: "BÁSICO"
      }
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/40 text-slate-800 flex flex-col items-center justify-start py-12 px-4 md:px-8">
      <div className="w-full max-w-4xl flex flex-col">
        {/* Botón de Retorno al Inicio */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-semibold self-start bg-white py-2.5 px-4 rounded-lg border border-slate-200 active:scale-95 mb-8 shadow-sm cursor-pointer"
        >
          <ArrowLeft02Icon className="size-4" />
          Volver al Inicio
        </Link>

        {/* Cabecera del Catalogo */}
        <div className="text-center mb-12 space-y-3 shrink-0">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
            <Coins01Icon className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900">
            Adquiere Tokens de SpaceShift
          </h1>
          <p className="mt-2 text-slate-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Potencia tus publicaciones de inmuebles con modelado 3D interactivo y procesamiento prioritario de IA. 
            ¡Elige el paquete que mejor se adapte a tus necesidades!
          </p>
        </div>

        {/* Catálogo en Columnas Verticales (Filas) */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-150 bg-white animate-pulse h-[110px]"
                >
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 rounded bg-slate-100" />
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-24 rounded bg-slate-100 shrink-0" />
                  <div className="h-8 w-24 rounded bg-slate-100 shrink-0" />
                  <div className="h-10 w-32 rounded bg-slate-100 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {paquetes?.map((paquete, index) => {
                  const styles = getPackageStyles(paquete.nombrePaquete)
                  const isPurchasingCurrent = isRedirecting && selectedPackageId === paquete.id

                  return (
                    <motion.div
                      key={paquete.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      whileHover={{ y: -2 }}
                      className={`relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8 rounded-2xl border shadow-sm transition-all duration-200 ${styles.cardClass}`}
                    >
                      {/* Badge flotante a la izquierda superior */}
                      {styles.badgeText && (
                        <span className={`absolute -top-3 left-6 rounded-full border px-3 py-0.5 text-[9px] font-extrabold tracking-wider ${styles.badgeClass}`}>
                          {styles.badgeText}
                        </span>
                      )}

                      {/* Columna 1: Nombre, Icono y Descripción */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold tracking-tight text-slate-900">
                            {paquete.nombrePaquete}
                          </h3>
                          {styles.icon}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                          {paquete.descripcion || "Recarga créditos de forma inmediata para tus conversiones y renders en 3D."}
                        </p>

                        {/* Resumen de beneficios en formato horizontal */}
                        <div className="hidden sm:flex items-center gap-4 mt-4 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <CheckmarkCircle02Icon className="size-3.5 text-emerald-500" />
                            Acreditación al instante
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckmarkCircle02Icon className="size-3.5 text-emerald-500" />
                            Soporte Prioritario
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckmarkCircle02Icon className="size-3.5 text-emerald-500" />
                            Pago 100% Seguro
                          </span>
                        </div>
                      </div>

                      {/* Columna 2: Créditos del Paquete */}
                      <div className="flex items-center gap-2 md:flex-col md:items-start shrink-0 min-w-[120px] md:border-l md:border-slate-100 md:pl-6 w-full md:w-auto">
                        <span className="text-xs text-slate-400 font-bold md:hidden">Créditos:</span>
                        <div className="text-2xl font-black tracking-tight text-slate-900 flex items-baseline gap-0.5">
                          {paquete.creditosPaquetes.toLocaleString()}
                          <span className="text-xs font-bold text-primary">SST</span>
                        </div>
                      </div>

                      {/* Columna 3: Precio (En Bolivianos Bs. BOB) */}
                      <div className="flex items-center gap-2 md:flex-col md:items-start shrink-0 min-w-[130px] md:border-l md:border-slate-100 md:pl-6 w-full md:w-auto">
                        <span className="text-xs text-slate-400 font-bold md:hidden">Precio:</span>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-black text-amber-600">
                            {paquete.precio.toFixed(2)}
                          </span>
                          <span className="ml-1 text-[10px] font-bold text-slate-500">Bs. (BOB)</span>
                        </div>
                      </div>

                      {/* Columna 4: Botón de Compra del Mismo Color Primario para Todos */}
                      <div className="w-full md:w-auto shrink-0 md:pl-6">
                        <Button
                          onClick={() => handlePurchase(paquete.id)}
                          disabled={isRedirecting}
                          className="w-full md:w-auto min-w-[140px] py-6 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-sm shrink-0 border-0 flex items-center justify-center cursor-pointer"
                        >
                          {isPurchasingCurrent ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Procesando...</span>
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
      </div>
    </div>
  )
}
