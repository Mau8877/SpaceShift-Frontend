import { createFileRoute } from "@tanstack/react-router"

import { MisClientesScreen } from "@/app/features/dashboard/screens"

export const Route = createFileRoute("/_auth/dashboard/clientes")({
  component: MisClientesScreen,
})
