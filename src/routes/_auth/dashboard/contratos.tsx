import { createFileRoute } from "@tanstack/react-router"

import { MisContratosScreen } from "@/app/features/dashboard/screens"

export const Route = createFileRoute("/_auth/dashboard/contratos")({
  component: MisContratosScreen,
})
