import { z } from "zod"

export const updatePerfilSchema = z.object({
  correo: z.email("Correo inválido").optional(),
  estadoConexion: z.boolean().optional(),
  tipoPerfil: z.string().min(1, "Tipo de perfil requerido").optional(),
  nombre: z.string().min(1, "Nombre requerido").optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
  fotoUrl: z
    .string()
    .refine(
      (value) => value.length === 0 || /^https?:\/\/.+/i.test(value),
      "La foto debe ser una URL válida"
    )
    .optional(),
})

export type UpdatePerfilFormValues = z.infer<typeof updatePerfilSchema>
