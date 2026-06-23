import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  AnalyticsUpIcon,
  Coins01Icon,
  DashboardSquare02Icon,
  FavouriteIcon,
  Home01Icon,
  Logout01Icon,
  SquareArrowUpRightIcon,
  UserGroup03Icon,
  UserIcon,
} from "hugeicons-react"
import { useGetMiPerfilQuery } from "@/app/features/profile/store"
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
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth)
  const { data: perfil } = useGetMiPerfilQuery(undefined, {
    skip: !isAuthenticated || !user?.id,
  })

  const handleLogout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api'}/auth/logout`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
    } catch { /* continuar con logout local si falla */ }
    dispatch(logout())
    dispatch(api.util.resetApiState())
    navigate({ to: "/" })
  }

  if (!mounted || !isAuthenticated || !user) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
  }

  const isAdmin = user.rol === "ROLE_ADMIN"
  const nombreInic = user.nombre[0] || "U"
  const apellidoInic = user.apellido ? user.apellido[0] : ""
  const fotoUrl = perfil?.fotoUrl?.trim() || null
  const navigateTo = (to: string) => navigate({ to })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer border-2 border-white/20 transition-transform hover:scale-105 sm:h-9 sm:w-9">
          {fotoUrl ? (
            <AvatarImage src={fotoUrl} alt={user.nombre} className="object-cover" />
          ) : null}
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
            onClick={() => navigateTo("/")}
          >
            <Home01Icon className="mr-2 h-4 w-4" />
            <span>Home</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateTo("/dashboard")}
          >
            <DashboardSquare02Icon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateTo("/favoritos")}
          >
            <FavouriteIcon className="mr-2 h-4 w-4" />
            <span>Mis Favoritos</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateTo("/publicar")}
          >
            <SquareArrowUpRightIcon className="mr-2 h-4 w-4" />
            <span>Publicar inmueble</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateTo("/creditos")}
          >
            <Coins01Icon className="mr-2 h-4 w-4" />
            <span>Créditos</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateTo("/profile")}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {isAdmin ? (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigateTo("/gestionar-usuarios")}
              >
                <UserGroup03Icon className="mr-2 h-4 w-4" />
                <span>Gestionar Usuarios</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigateTo("/reportes")}
              >
                <AnalyticsUpIcon className="mr-2 h-4 w-4" />
                <span>Reportes del Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="focus:text-destructive-foreground cursor-pointer text-destructive focus:bg-destructive"
        >
          <Logout01Icon className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
