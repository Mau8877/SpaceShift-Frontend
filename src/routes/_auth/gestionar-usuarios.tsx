import { createFileRoute } from "@tanstack/react-router"
import { GestionarUsuariosScreen } from "@/app/features/admin"
import { PaginaNoEncontrada } from "@/components/PaginaNoEncontrada"

export const Route = createFileRoute("/_auth/gestionar-usuarios")({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  if (auth.user?.rol !== "ROLE_ADMIN") {
    return <PaginaNoEncontrada />
  }

  return <GestionarUsuariosScreen />
}
