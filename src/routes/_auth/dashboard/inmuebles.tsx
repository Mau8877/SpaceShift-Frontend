import { createFileRoute } from "@tanstack/react-router"

import { MisInmueblesScreen } from "@/app/features/dashboard/screens"

export const Route = createFileRoute("/_auth/dashboard/inmuebles")({
  component: MisInmueblesScreen,
})
