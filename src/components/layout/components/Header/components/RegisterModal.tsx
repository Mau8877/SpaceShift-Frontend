import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Loading01Icon } from "hugeicons-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useRegisterMutation } from "../store"
import { getRegisterSchema } from "../schema"
import { setCredentials, useAppDispatch } from "@/app/store"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface RegisterModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export function RegisterModal({ isOpen = false, onClose }: RegisterModalProps) {
  const [registerUser, { isLoading }] = useRegisterMutation()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const schema = getRegisterSchema(t)

  const [tipoCliente, setTipoCliente] = useState<"PERSONAL" | "EMPRESA">(
    "PERSONAL"
  )

  const zodValidator = (fieldName: keyof typeof schema.shape) => {
    return ({ value }: { value: any }) => {
      const result = schema.shape[fieldName].safeParse(value)
      return result.success ? undefined : result.error.issues[0]?.message
    }
  }

  const form = useForm({
    defaultValues: {
      nombre: "",
      apellido: "" as string | null,
      correo: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (
          tipoCliente === "PERSONAL" &&
          (!value.apellido || value.apellido.trim().length < 2)
        ) {
          toast.error(t("header.register.apellido.advertencia"))
          return
        }

        const payload = {
          nombre: value.nombre,
          apellido: tipoCliente === "EMPRESA" ? null : value.apellido,
          correo: value.correo,
          password: value.password,
          tipoPerfil: tipoCliente,
        }

        const response = await registerUser(payload).unwrap()
        dispatch(setCredentials({ token: response.token }))

        toast.success(t("header.register.toast.cuenta-creada"))

        if (onClose) onClose()
        form.reset()
      } catch (error) {}
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (onClose) onClose()
      form.reset()
      setTipoCliente("PERSONAL")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("header.register.title")}</DialogTitle>
          <DialogDescription>
            {t("header.register.descripcion")}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        {/* Switch de Tipo de Cuenta */}
        <div className="flex w-full rounded-md border bg-slate-100 p-1">
          <Button
            type="button"
            variant={tipoCliente === "PERSONAL" ? "default" : "ghost"}
            className="h-8 w-1/2 text-xs transition-all"
            onClick={() => {
              setTipoCliente("PERSONAL")
              form.setFieldValue("apellido", "")
            }}
          >
            {t("header.register.personal")}
          </Button>
          <Button
            type="button"
            variant={tipoCliente === "EMPRESA" ? "default" : "ghost"}
            className="h-8 w-1/2 text-xs transition-all"
            onClick={() => {
              setTipoCliente("EMPRESA")
              form.setFieldValue("apellido", null)
            }}
          >
            {t("header.register.empresa")}
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4 pt-2"
        >
          {/* Campo Nombre / Razón Social */}
          <form.Field
            name="nombre"
            validators={{ onChange: zodValidator("nombre") }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>
                  {tipoCliente === "EMPRESA"
                    ? t("header.register.razon-social")
                    : t("header.register.nombre")}
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder={
                    tipoCliente === "EMPRESA"
                      ? t("header.register.empresa")
                      : t("header.register.nombre")
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs font-medium text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          {/* Campo Apellido (Condicional) */}
          {tipoCliente === "PERSONAL" && (
            <form.Field
              name="apellido"
              validators={{
                onChange: ({ value }) =>
                  !value || value.length < 2
                    ? t("header.register.apellido.advertencia")
                    : undefined,
              }}
              children={(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>
                    {t("header.register.apellido.titulo")}
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isLoading}
                    placeholder={t("header.register.apellido.titulo")}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs font-medium text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            />
          )}

          {/* Correo */}
          <form.Field
            name="correo"
            validators={{ onChange: zodValidator("correo") }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>{t("header.login.correo")}</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="user@spaceshift.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs font-medium text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          {/* Password */}
          <form.Field
            name="password"
            validators={{ onChange: zodValidator("password") }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>
                  {t("header.login.contrasena")}
                </Label>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs font-medium text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          {/* Confirmar Password */}
          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                if (value !== fieldApi.form.getFieldValue("password")) {
                  return t("auth.register.validation.passwords-mismatch")
                }
                return undefined
              },
            }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>
                  {t("header.register.confirmar-contrasena")}
                </Label>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs font-medium text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          <div className="pt-2">
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? (
                <>
                  <Loading01Icon className="mr-2 h-4 w-4 animate-spin" />
                  {t("header.register.creando-cuenta")}
                </>
              ) : (
                t("header.register.registrarse")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
