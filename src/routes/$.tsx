import { createFileRoute } from "@tanstack/react-router"
import { PaginaNoEncontrada } from "@/components/PaginaNoEncontrada"

export const Route = createFileRoute("/$")({
  component: PaginaNoEncontrada,
})
