import { createFileRoute } from "@tanstack/react-router"
import { CrearOfertaScreen } from "@/app/features/publicaciones/screens/CrearOfertaScreen"

export const Route = createFileRoute("/_auth/crear-oferta/$id")({
  component: CrearOfertaScreen,
})
