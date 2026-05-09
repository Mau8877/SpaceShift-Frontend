import { z } from "zod"

export const crearUsuarioSchema = z.object({
  correo: z.email("Correo invalido"),
  password: z.string().min(6, "Password debe tener al menos 6 caracteres"),
  rol: z.string().min(1, "Rol requerido"),
  tipoPerfil: z.string().min(1, "Tipo de perfil requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
})

export const editarUsuarioSchema = z.object({
  correo: z.email("Correo invalido").optional(),
  nombre: z.string().min(1, "Nombre requerido").optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
  tipoPerfil: z.string().min(1, "Tipo de perfil requerido").optional(),
})

export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>
export type EditarUsuarioFormValues = z.infer<typeof editarUsuarioSchema>
