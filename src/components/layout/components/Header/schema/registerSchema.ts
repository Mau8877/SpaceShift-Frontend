import * as z from "zod"

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no puede excederse de 100 caracteres" }),
  apellido: z
    .string()
    .max(100, { message: "No puede excederse de 100 caracteres" })
    .nullable()
    .optional(),
  correo: z
    .string()
    .min(1, { message: "El correo es obligatorio" })
    .email({ message: "Introduce un correo válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Debes confirmar tu contraseña" }),
})

export type RegisterSchema = z.infer<typeof registerSchema>
