import { useState } from "react"
import { useTranslation } from "react-i18next"
import { HelpCircleIcon, Login01Icon } from "hugeicons-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { IdiomaModal } from "../components"
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
  const { t, i18n } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between bg-primary px-2 text-white sm:px-4">
        {/* --- PARTE IZQUIERDA: Logo --- */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SidebarTrigger className="h-9 w-9 text-white hover:bg-white/20 hover:text-white" />
          <Separator
            orientation="vertical"
            className="mx-1 h-4 bg-white/20 sm:mx-2"
          />
          <Link
            to="/"
            className="truncate text-sm font-bold tracking-tighter sm:text-lg"
          >
            SpaceShift<span className="text-blue-300">.com</span>
          </Link>
        </div>

        {/* --- PARTE DERECHA: Acciones --- */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {/* Tooltip Moneda */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 px-1 text-[10px] font-bold text-white hover:bg-white/10 sm:px-2 sm:text-xs"
              >
                BOB
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("header.tooltips.currency")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Tooltip Idioma - Abre el Modal */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 overflow-hidden rounded-full hover:bg-white/10"
                onClick={() => setModalOpen(true)}
              >
                <img
                  src={
                    i18n.language.includes("en")
                      ? "https://flagcdn.com/w40/us.png"
                      : "https://flagcdn.com/w40/bo.png"
                  }
                  alt="Flag"
                  className="h-4 w-4 object-cover sm:h-5 sm:w-5"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("header.tooltips.language")}</p>
            </TooltipContent>
          </Tooltip>

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
              <p>{t("header.tooltips.help")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Publica tu inmueble  */}
          <Button
            variant="outline"
            className="h-8 shrink-0 border-white bg-transparent px-2 text-[10px] font-semibold text-white transition-all hover:bg-white hover:text-primary sm:h-9 sm:px-4 sm:text-xs"
          >
            <span className="hidden md:inline">
              {t("header.buttons.publishLong")}
            </span>
            <span className="md:hidden">
              {t("header.buttons.publishShort")}
            </span>
          </Button>

          {/* Login (Traducido) */}
          <div className="flex shrink-0 items-center">
            <Button
              variant="secondary"
              className="hidden h-8 rounded-sm bg-white px-3 text-[10px] font-bold text-primary hover:bg-slate-100 sm:flex sm:h-9 sm:text-xs"
            >
              {t("header.buttons.login")}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="flex h-8 w-8 rounded-sm bg-white text-primary hover:bg-slate-100 sm:hidden"
            >
              <Login01Icon size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Modal de Idioma */}
      <IdiomaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </TooltipProvider>
  )
}
