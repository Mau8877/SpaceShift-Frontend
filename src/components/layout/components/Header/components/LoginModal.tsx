import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import {
  HelpCircleIcon,
  Loading01Icon,
  LockPasswordIcon,
  Mail01Icon,
  ViewIcon,
  ViewOffIcon,
} from "hugeicons-react"
import { useTranslation } from "react-i18next"
import { useState } from "react"
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
  const [showPassword, setShowPassword] = useState(false)
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
      } catch (error) { }
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
      <DialogContent className="overflow-hidden p-0 sm:max-w-[425px]">
        <div className="bg-primary/5 absolute top-0 left-0 h-1 w-full" />
        <div className="px-6 pt-8 pb-4">
          <DialogHeader className="flex flex-col items-center gap-2 text-center">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-3xl p-3 text-primary ring-8 ring-primary/5 transition-all duration-500 hover:rotate-12 hover:scale-110">
              <LockPasswordIcon className="h-full w-full" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {t("header.login.titulo")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80 max-w-[280px]">
                {t("header.login.descripcion")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-8">

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
                <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2.5 duration-500">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold tracking-wide"
                  >
                    {t("header.login.correo")}
                  </Label>
                  <div className="relative">
                    <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                      <Mail01Icon className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                      placeholder="user@spaceshift.com"
                      className="h-11 border-border/60 bg-muted/30 focus-visible:ring-primary/20 transition-all duration-300 pl-10 focus:ring-4"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="animate-in fade-in slide-in-from-left-2 text-xs font-medium text-destructive">
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
                <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2.5 delay-100 duration-500">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-semibold tracking-wide"
                    >
                      {t("header.login.contrasena")}
                    </Label>
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <HelpCircleIcon className="h-3.5 w-3.5" />
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                      <LockPasswordIcon className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="h-11 border-border/60 bg-muted/30 focus-visible:ring-primary/20 transition-all duration-300 px-10 focus:ring-4"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <ViewOffIcon className="h-4.5 w-4.5" />
                      ) : (
                        <ViewIcon className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="animate-in fade-in slide-in-from-left-2 text-xs font-medium text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="animate-in fade-in slide-in-from-bottom-2 delay-200 flex flex-col gap-4 pt-4 duration-500">
              <Button
                disabled={isLoading}
                type="submit"
                className="bg-primary hover:bg-primary/90 h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loading01Icon className="mr-2 h-5 w-5 animate-spin" />
                    {t("header.login.ingresando")}
                  </>
                ) : (
                  t("header.login.iniciar-sesion")
                )}
              </Button>

              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-muted-foreground text-sm font-medium">
                  {t("header.login.sin-cuenta")}
                </p>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onSwitchToRegister}
                  className="hover:bg-primary/5 hover:text-primary h-11 w-full border-2 border-dashed font-bold transition-all duration-300"
                >
                  {t("header.login.registrate")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
