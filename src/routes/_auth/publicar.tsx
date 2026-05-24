import { createFileRoute } from "@tanstack/react-router"
import { PublicacionScreen } from "@/app/features/publicaciones"

// Esta ruta será "/publicar", pero estará protegida por la autenticación del layout "_auth"
import { z } from "zod"

const publicacionSearchSchema = z.object({
  edit: z.string().optional(),
})

export const Route = createFileRoute("/_auth/publicar")({
  validateSearch: (search) => publicacionSearchSchema.parse(search),
  component: PublicacionScreen,
})
