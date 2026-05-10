import { useState } from "react"
import { HelpCircleIcon, Login01Icon } from "hugeicons-react"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  LoginModal,
  NotificationBell,
  RegisterModal,
  UserDropdown,
} from "../components"
import { useIsMounted } from "@/app/utils"
import { useAppSelector } from "@/app/store"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Header() {
  const navigate = useNavigate()

  // Estados para controlar los dos modales
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

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
          {/* El trigger del Sidebar solo se muestra si el usuario está autenticado */}
          {isMounted && isAuthenticated && (
            <>
              <SidebarTrigger className="h-9 w-9 text-white hover:bg-white/20 hover:text-white" />
              <Separator
                orientation="vertical"
                className="mx-1 h-4 bg-white/20 sm:mx-2"
              />
            </>
          )}
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

    </TooltipProvider>
  )
}
