import { createFileRoute } from "@tanstack/react-router"
import { GestionarUsuariosScreen } from "@/app/features/admin"

export const Route = createFileRoute("/_auth/gestionar-usuarios")({
  component: RouteComponent,
})

function RouteComponent() {
  return <GestionarUsuariosScreen />
}
