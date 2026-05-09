import { z } from "zod"

export const createUsuarioSchema = z.object({
  correo: z.email("Correo invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  rol: z.string().min(1, "Rol requerido"),
  tipoPerfil: z.string().min(1, "Tipo de perfil requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
})

export const updateUsuarioSchema = z.object({
  correo: z.email("Correo invalido").optional(),
  nombre: z.string().min(1, "Nombre requerido").optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
  tipoPerfil: z.string().min(1, "Tipo de perfil requerido").optional(),
})

export type CreateUsuarioFormValues = z.infer<typeof createUsuarioSchema>
export type UpdateUsuarioFormValues = z.infer<typeof updateUsuarioSchema>
