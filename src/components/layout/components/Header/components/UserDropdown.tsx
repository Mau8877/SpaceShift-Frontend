import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { Logout01Icon, Settings01Icon, UserIcon } from "hugeicons-react"
import { api } from "@/app/store/api/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout, useAppDispatch, useAppSelector } from "@/app/store"

export function UserDropdown() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(api.util.resetApiState())
    navigate({ to: "/" })
  }

  if (!mounted || !isAuthenticated || !user) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
  }

  const nombreInic = user.nombre[0] || "U"
  const apellidoInic = user.apellido ? user.apellido[0] : ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer border-2 border-white/20 transition-transform hover:scale-105 sm:h-9 sm:w-9">
          <AvatarImage src="" alt={user.nombre} />
          <AvatarFallback className="bg-blue-600 text-[10px] font-bold text-white sm:text-xs">
            {nombreInic}
            {apellidoInic}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {user.nombre} {user.apellido || ""}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate({ to: "/profile" })}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t("header.dropdown-menu.perfil")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate({ to: "/settings" })}
          >
            <Settings01Icon className="mr-2 h-4 w-4" />
            <span>{t("header.dropdown-menu.ajustes")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="focus:text-destructive-foreground cursor-pointer text-destructive focus:bg-destructive"
        >
          <Logout01Icon className="mr-2 h-4 w-4" />
          <span>{t("header.dropdown-menu.cerrar-sesion")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
