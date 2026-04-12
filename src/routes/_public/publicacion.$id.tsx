import { createFileRoute } from "@tanstack/react-router"
import { PublicacionDetailsScreen } from "@/app/features/publicaciones"

export const Route = createFileRoute("/_public/publicacion/$id")({
  component: PublicacionDetailsScreen,
})
