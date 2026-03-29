import { createFileRoute } from "@tanstack/react-router"
import { FaqScreen } from "@/app/features/faq"

export const Route = createFileRoute("/_public/faq")({
  component: FaqScreen,
})
