import { createFileRoute } from "@tanstack/react-router"
import { PublicacionScreen } from "@/app/features/publicaciones"

// Esta ruta será "/publicar", pero estará protegida por la autenticación del layout "_auth"
export const Route = createFileRoute("/_auth/publicar")({
  component: PublicacionScreen,
})
