import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { Loading01Icon } from "hugeicons-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useLoginMutation } from "../store"
import { getLoginSchema } from "../schema"

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
  onSwitchToRegister?: () => void
}

export function LoginModal({
  isOpen = false,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const router = useRouter()

  const schema = getLoginSchema(t)

  const zodValidator = (fieldName: keyof typeof schema.shape) => {
    return ({ value }: { value: any }) => {
      const result = schema.shape[fieldName].safeParse(value)
      return result.success ? undefined : result.error.issues[0]?.message
    }
  }

  const form = useForm({
    defaultValues: {
      correo: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await login(value).unwrap()
        dispatch(setCredentials({ token: response.token }))

        router.invalidate()
        router.navigate({ to: "/dashboard" })

        toast.success(t("header.login.toast.titulo"), {
          description: t("header.login.toast.descripcion"),
        })

        if (onClose) onClose()
        form.reset()
      } catch (error) {}
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
          <DialogTitle>{t("header.login.titulo")}</DialogTitle>
          <DialogDescription>{t("header.login.descripcion")}</DialogDescription>
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
            validators={{ onChange: zodValidator("correo") }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t("header.login.correo")}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="user@spaceshift.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm font-medium text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: zodValidator("password") }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {t("header.login.contrasena")}
                </Label>
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
                    {field.state.meta.errors[0]}
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
                  {t("header.login.ingresando")}
                </>
              ) : (
                t("header.login.iniciar-sesion")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("header.login.sin-cuenta")}{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-primary hover:underline"
              >
                {t("header.login.registrate")}
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
