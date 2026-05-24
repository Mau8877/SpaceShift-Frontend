import { createFileRoute } from "@tanstack/react-router"
import { CreditosScreen } from "@/app/features/tokens/screens/CreditosScreen"

export const Route = createFileRoute("/_public/creditos")({
  component: CreditosScreen,
})
