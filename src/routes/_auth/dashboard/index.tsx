import { createFileRoute } from "@tanstack/react-router"

import { DashboardScreen } from "@/app/features/dashboard/screens"

export const Route = createFileRoute("/_auth/dashboard/")({
  component: DashboardScreen,
})
