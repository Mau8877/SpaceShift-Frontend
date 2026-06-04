import { createFileRoute } from "@tanstack/react-router"
import { DetalleContratoScreen } from "@/app/features/dashboard/screens"

export const Route = createFileRoute("/_auth/dashboard/contratos/$id")({
  component: DetalleContratoScreen,
})
