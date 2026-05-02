import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/app/features/dashboard/layout"

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardLayout,
})
