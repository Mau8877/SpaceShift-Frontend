import { PublicacionTour3DScreen } from "@/app/features/publicaciones/screens"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/publicacion-tour-3d/$id")({
  component: PublicacionTour3DScreen,
})
