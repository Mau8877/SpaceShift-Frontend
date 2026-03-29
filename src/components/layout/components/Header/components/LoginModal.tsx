import { useForm } from "@tanstack/react-form"
import { Loading01Icon } from "hugeicons-react"
import { toast } from "sonner"
import { useLoginMutation } from "../store"
import { loginSchema } from "../schema"

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

import { setCredentials, useAppDispatch } from "@/app/store"

interface LoginModalProps {
  isOpen?: boolean
  onClose?: () => void
  // 🚀 Añadimos esta prop para cambiar de modal
  onSwitchToRegister?: () => void
}

const zodFieldValidator =
  (schema: any) =>
  ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

export function LoginModal({
  isOpen = false,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()

  const form = useForm({
    defaultValues: {
      correo: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await login(value).unwrap()
        dispatch(setCredentials({ token: response.token }))

        toast.success("¡Bienvenido!", { description: "Sesión iniciada." })

        if (onClose) onClose()
        form.reset()
      } catch (error) {
        // Manejado por el middleware global
      }
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (onClose) onClose()
      form.reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ingresa a tu Cuenta</DialogTitle>
          <DialogDescription>
            Gestiona tus inmuebles en SpaceShift.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <form.Field
            name="correo"
            validators={{
              onChange: zodFieldValidator(loginSchema.shape.correo),
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Correo Electrónico</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="mauro@spaceshift.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: zodFieldValidator(loginSchema.shape.password),
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Contraseña</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm font-medium text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <div className="flex flex-col gap-4 pt-4">
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? (
                <>
                  <Loading01Icon className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:underline"
              >
                Regístrate gratis
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
