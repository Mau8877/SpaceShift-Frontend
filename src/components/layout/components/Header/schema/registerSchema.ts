import * as z from "zod"
import type { TFunction } from "i18next"

export const getRegisterSchema = (t: TFunction) =>
  z
    .object({
      nombre: z
        .string()
        .min(2, { message: t("auth.register.validation.name-min") })
        .max(100, { message: t("auth.register.validation.name-max") }),
      apellido: z
        .string()
        .max(100, { message: t("auth.register.validation.lastname-max") })
        .nullable()
        .optional(),
      correo: z
        .string()
        .min(1, { message: t("auth.register.validation.email-required") })
        .email({ message: t("auth.register.validation.email-invalid") }),
      password: z
        .string()
        .min(6, { message: t("auth.register.validation.password-min") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("auth.register.validation.confirm-required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.register.validation.passwords-mismatch"),
      path: ["confirmPassword"],
    })

export type RegisterSchema = z.infer<ReturnType<typeof getRegisterSchema>>
