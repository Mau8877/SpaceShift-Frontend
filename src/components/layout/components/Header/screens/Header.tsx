import { useState, useEffect } from "react"
import { HelpCircleIcon, Login01Icon, Coins01Icon } from "hugeicons-react"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  LoginModal,
  NotificationBell,
  RegisterModal,
  UserDropdown,
} from "../components"
import { useIsMounted } from "@/app/utils"
import { useAppSelector } from "@/app/store"
import { useGetMiSaldoQuery } from "@/app/features/tokens"
import { ConfettiCelebration } from "@/components/ui/ConfettiCelebration"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Header() {
  const navigate = useNavigate()

  // Estados para controlar los dos modales y pasarela de Stripe
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)

  // Escuchar redirección de Stripe Checkout y acciones externas
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const cancel = urlParams.get("cancel")
    const login = urlParams.get("login")

    // Si viene la solicitud de login desde un botón de página pública
    if (login === "true") {
      setLoginModalOpen(true)
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }

    if (success === "true") {
      setConfettiActive(true)
      toast.success("¡Compra de créditos completada con éxito! 🎉", {
        description: "Tus nuevos créditos SST han sido acreditados en Bolivianos (BOB).",
        duration: 8000,
      })
      
      // Limpiar parámetros url de forma silenciosa
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)

      // Detener confeti después de unos segundos
      setTimeout(() => setConfettiActive(false), 7500)
    } else if (cancel === "true") {
      toast.warning("Compra cancelada", {
        description: "No se realizó ningún cobro a tu tarjeta de crédito.",
        duration: 5000,
      })
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [])

  // Extraer estado de autenticación de Redux
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const isMounted = useIsMounted()

  // Función para proteger acciones (como Publicar Inmueble)
  const handleProtectedAction = (to: string) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true)
    } else {
      navigate({ to })
    }
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between bg-primary px-2 text-white sm:px-4">
        {/* --- PARTE IZQUIERDA: Logo --- */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="truncate text-sm font-bold tracking-tighter sm:text-lg"
          >
            SpaceShift<span className="text-blue-300">.com</span>
          </Link>
        </div>

        {/* --- PARTE DERECHA: Acciones --- */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {/* Ayuda */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-white hover:bg-white/10"
                onClick={() => navigate({ to: "/faq" })}
              >
                <HelpCircleIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ayuda</p>
            </TooltipContent>
          </Tooltip>

          {/* Publica tu inmueble (Protegido) */}
          <Button
            variant="outline"
            onClick={() => handleProtectedAction("/publicar")}
            className="h-8 shrink-0 border-white bg-transparent px-2 text-[10px] font-semibold text-white transition-all hover:bg-white hover:text-primary sm:h-9 sm:px-4 sm:text-xs"
          >
            <span className="hidden md:inline">Publica tu inmueble</span>
            <span className="md:hidden">Publicar</span>
          </Button>

          {/* Compra de créditos (Público) */}
          <Link
            to="/creditos"
            className="h-8 shrink-0 flex items-center gap-1.5 px-2.5 text-[10px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all active:scale-95 sm:h-9 sm:px-3.5 sm:gap-2 cursor-pointer rounded-md shadow-inner shrink-0"
          >
            <Coins01Icon className="size-3.5 sm:size-4 animate-pulse text-amber-300" />
            <span>Compra de créditos</span>
          </Link>

          {/* Créditos (Solo si está autenticado) */}
          {isMounted && isAuthenticated && (
            <HeaderCreditsBadge />
          )}

          {isMounted && isAuthenticated && (
            <Separator
              orientation="vertical"
              className="mx-1 h-4 bg-white/20 sm:mx-0"
            />
          )}

          {/* --- SECCIÓN DE USUARIO: Login vs Avatar --- */}
          {!isMounted ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/20 sm:h-9 sm:w-24 sm:rounded-sm"></div>
          ) : !isAuthenticated ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setLoginModalOpen(true)}
                className="hidden h-8 rounded-sm bg-white px-3 text-[10px] font-bold text-primary hover:bg-slate-100 sm:flex sm:h-9 sm:text-xs"
              >
                Iniciar sesión
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setLoginModalOpen(true)}
                className="flex h-8 w-8 rounded-sm bg-white text-primary hover:bg-slate-100 sm:hidden"
              >
                <Login01Icon size={18} />
              </Button>
            </>
          ) : (
            <>
              <NotificationBell />
              <UserDropdown />
            </>
          )}
        </div>
      </header>

      {/* Modales */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false)
          setTimeout(() => setRegisterModalOpen(true), 150)
        }}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false)
          setTimeout(() => setLoginModalOpen(true), 150)
        }}
      />



      {/* Animación Espectacular de Confeti al Retornar con Éxito */}
      <ConfettiCelebration active={confettiActive} />

    </TooltipProvider>
  )
}

function HeaderCreditsBadge() {
  const { data: saldoData, isLoading } = useGetMiSaldoQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/profile"
          className="flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/25 active:scale-95 sm:h-9 sm:px-3.5 sm:gap-2 cursor-pointer shadow-inner shrink-0"
        >
          <Coins01Icon className="size-3.5 sm:size-4 animate-bounce text-amber-300" style={{ animationDuration: '3s' }} />
          {isLoading ? (
            <div className="h-3 w-8 animate-pulse rounded bg-white/25" />
          ) : (
            <span className="tracking-tight">
              {(saldoData?.saldoCreditos ?? 0).toLocaleString()}{" "}
              <span className="text-[10px] text-blue-200 font-bold hidden sm:inline">SST</span>
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tus créditos de SpaceShift</p>
      </TooltipContent>
    </Tooltip>
  )
}

