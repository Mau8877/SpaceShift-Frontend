import { createFileRoute } from "@tanstack/react-router"
import { IotDashboardScreen } from "@/app/features/admin"

export const Route = createFileRoute("/_auth/gestionar-iot")({
  component: RouteComponent,
})

function RouteComponent() {
  return <IotDashboardScreen />
}
