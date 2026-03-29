import * as z from "zod"

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, { message: "El correo es obligatorio" })
    .email({ message: "Introduce un correo válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export type LoginSchema = z.infer<typeof loginSchema>
