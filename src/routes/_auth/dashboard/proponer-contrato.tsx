import { createFileRoute } from "@tanstack/react-router"
import { ProponerContratoScreen } from "@/app/features/dashboard/screens"

export const Route = createFileRoute("/_auth/dashboard/proponer-contrato")({
  component: ProponerContratoScreen,
})
