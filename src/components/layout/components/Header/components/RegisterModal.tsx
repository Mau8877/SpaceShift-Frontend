import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Loading01Icon } from "hugeicons-react"
import { toast } from "sonner"
import { useRegisterMutation } from "../store"
import { registerSchema } from "../schema"
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

const zodFieldValidator =
  (schema: any) =>
  ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

export function RegisterModal({ isOpen = false, onClose }: RegisterModalProps) {
  const [registerUser, { isLoading }] = useRegisterMutation()
  const dispatch = useAppDispatch()

  const [tipoCliente, setTipoCliente] = useState<"PERSONAL" | "EMPRESA">(
    "PERSONAL"
  )

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
          toast.error("Datos incompletos", {
            description: "El apellido debe tener al menos 2 caracteres.",
          })
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

        toast.success("¡Bienvenido!", {
          description: "Tu cuenta ha sido creada con éxito.",
        })

        if (onClose) onClose()
        form.reset()
      } catch (error) {
        // Manejado por baseQuery
      }
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
          <DialogTitle>Crea tu Cuenta</DialogTitle>
          <DialogDescription>
            Únete a SpaceShift para publicar o buscar tu próximo espacio.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

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
            Personal
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
            Empresa
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
          <form.Field
            name="nombre"
            validators={{
              onChange: zodFieldValidator(registerSchema.shape.nombre),
            }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>
                  {tipoCliente === "EMPRESA" ? "Razón Social" : "Nombre"}
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder={
                    tipoCliente === "EMPRESA"
                      ? "Ej. Inmobiliaria XYZ"
                      : "Ej. Mauro"
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {tipoCliente === "PERSONAL" && (
            <form.Field
              name="apellido"
              validators={{
                onChange: ({ value }) => {
                  if (value === null) return undefined
                  return value.length < 2
                    ? "Debe tener al menos 2 caracteres"
                    : undefined
                },
              }}
              children={(field) => (
                <div className="space-y-1">
                  <Label htmlFor={field.name}>Apellido</Label>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ej. Barrios"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs font-medium text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />
          )}

          <form.Field
            name="correo"
            validators={{
              onChange: zodFieldValidator(registerSchema.shape.correo),
            }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Correo Electrónico</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="mauro@spaceshift.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="password"
            validators={{
              onChange: zodFieldValidator(registerSchema.shape.password),
            }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Contraseña</Label>
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
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                if (value !== fieldApi.form.getFieldValue("password")) {
                  return "Las contraseñas no coinciden"
                }
                return zodFieldValidator(registerSchema.shape.confirmPassword)({
                  value,
                })
              },
            }}
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Confirmar Contraseña</Label>
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
                    {field.state.meta.errors.join(", ")}
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
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
