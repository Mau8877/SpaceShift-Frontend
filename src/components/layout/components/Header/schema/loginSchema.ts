import * as z from "zod"
import type { TFunction } from "i18next"

export const getLoginSchema = (t: TFunction) =>
  z.object({
    correo: z
      .string()
      .min(1, { message: t("auth.login.validation.email-required") })
      .email({ message: t("auth.login.validation.email-invalid") }),
    password: z
      .string()
      .min(6, { message: t("auth.login.validation.password-min") }),
  })

export type LoginSchema = z.infer<ReturnType<typeof getLoginSchema>>
