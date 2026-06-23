import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  Loading01Icon,
  LockPasswordIcon,
  Mail01Icon,
  ViewIcon,
  ViewOffIcon,
} from "hugeicons-react"
import { useState } from "react"
import { toast } from "sonner"
import { useLoginMutation } from "../store"
import { getLoginSchema } from "../schema"
import {
  useSolicitarRecuperacionMutation,
  useValidarCodigoMutation,
  useCambiarPasswordMutation,
} from "@/app/features/auth/store/passwordRecoveryApi"

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
  const router = useRouter()

// Estados para recuperación de contraseña
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<"correo" | "codigo" | "nueva_password">("correo")
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [verifiedCode, setVerifiedCode] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [solicitarRecuperacion, { isLoading: isSendingCode }] = useSolicitarRecuperacionMutation()
  const [validarCodigo, { isLoading: isValidatingCode }] = useValidarCodigoMutation()
  const [cambiarPassword, { isLoading: isChangingPassword }] = useCambiarPasswordMutation()

  const schema = getLoginSchema()

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
        
        const searchParams = new URLSearchParams(window.location.search)
        const redirectUrl = searchParams.get("redirect")
        if (redirectUrl) {
          try {
            const urlObj = new URL(redirectUrl, window.location.origin)
            if (urlObj.origin === window.location.origin) {
              router.navigate({ to: urlObj.pathname + urlObj.search })
            } else {
              router.navigate({ to: "/dashboard" })
            }
          } catch (e) {
            router.navigate({ to: "/dashboard" })
          }
        } else {
          router.navigate({ to: "/dashboard" })
        }

        toast.success("Inicio de sesión exitoso", {
          description: "Bienvenido nuevamente.",
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
      setShowRecovery(false)
      setRecoveryStep("correo")
      setRecoveryEmail("")
      setVerifiedCode("")
      setCode("")
      setNewPassword("")
      setShowNewPassword(false)
    }
  }

  // Handlers para recuperación de contraseña
  const handleSendCode = async () => {
    if (!recoveryEmail.trim()) {
      toast.error("Ingresa tu correo electrónico")
      return
    }
    try {
      await solicitarRecuperacion({ correo: recoveryEmail }).unwrap()
      toast.success("Código enviado a tu correo")
      setRecoveryStep("codigo")
    } catch {
      toast.error("Error al enviar el código. Verifica el correo.")
    }
  }

  const handleVerifyCode = async (code: string) => {
    if (!code.trim()) {
      toast.error("Ingresa el código de verificación")
      return
    }
    try {
      await validarCodigo({ correo: recoveryEmail, codigo: code }).unwrap()
      toast.success("Código verificado")
      setVerifiedCode(code)
      setRecoveryStep("nueva_password")
    } catch {
      toast.error("Código inválido o expirado")
    }
  }

const handleChangePassword = async (newPassword: string) => {
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (!verifiedCode) {
      toast.error("Código de verificación no encontrado")
      return
    }
    try {
      await cambiarPassword({ correo: recoveryEmail, codigo: verifiedCode, nuevaPassword: newPassword }).unwrap()
      toast.success("Contraseña actualizada correctamente")
      setShowRecovery(false)
      setRecoveryStep("correo")
      setRecoveryEmail("")
      setVerifiedCode("")
} catch {
      toast.error("Error al cambiar la contraseña")
    }
  }

const resetRecovery = () => {
    setShowRecovery(false)
    setRecoveryStep("correo")
    setRecoveryEmail("")
    setVerifiedCode("")
    setCode("")
    setNewPassword("")
    setShowNewPassword(false)
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[425px]">
        <div className="bg-primary/5 absolute top-0 left-0 h-1 w-full" />
        
        {showRecovery ? (
          <div className="px-6 pt-8 pb-4">
            <DialogHeader className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-3xl p-3 text-primary ring-8 ring-primary/5">
                <LockPasswordIcon className="h-full w-full" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Recuperar contraseña
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80 max-w-[280px]">
                  Sigue los pasos para restablecer tu contraseña.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
        ) : (
          <div className="px-6 pt-8 pb-4">
            <DialogHeader className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-3xl p-3 text-primary ring-8 ring-primary/5 transition-all duration-500 hover:rotate-12 hover:scale-110">
                <LockPasswordIcon className="h-full w-full" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Iniciar sesión
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80 max-w-[280px]">
                  Accede a tu cuenta para continuar.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
        )}

        <div className="px-6 pb-8">
          {showRecovery ? (
            <div className="space-y-6">
              {recoveryStep === "correo" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Recuperar contraseña</h3>
                    <p className="text-sm text-muted-foreground">Ingresa tu correo electrónico para recibir un código de verificación.</p>
                  </div>
                  <div className="relative">
                    <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                      <Mail01Icon className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="h-11 pl-10"
                      autoComplete="email"
                    />
                  </div>
                  <Button
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                    className="w-full h-11"
                  >
                    {isSendingCode ? <Loading01Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enviar código
                  </Button>
                </div>
              )}

              {recoveryStep === "codigo" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Verificar código</h3>
                    <p className="text-sm text-muted-foreground">El código fue enviado a <span className="font-medium text-primary">{recoveryEmail}</span></p>
                  </div>
                  <Input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-11 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  <Button
                    onClick={() => handleVerifyCode(code)}
                    disabled={isValidatingCode || code.length < 6}
                    className="w-full h-11"
                  >
                    {isValidatingCode ? <Loading01Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verificar código
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setRecoveryStep("correo")}
                    className="w-full"
                  >
                    <ArrowLeft01Icon className="mr-1 h-4 w-4" />
                    Volver
                  </Button>
                </div>
              )}

              {recoveryStep === "nueva_password" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckmarkCircle02Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Código verificado</h3>
                    <p className="text-sm text-muted-foreground">Ingresa tu nueva contraseña.</p>
                  </div>
                  <div className="relative">
                    <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                      <LockPasswordIcon className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      {showNewPassword ? <ViewOffIcon className="h-4.5 w-4.5" /> : <ViewIcon className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => handleChangePassword(newPassword)}
                    disabled={isChangingPassword || newPassword.length < 6}
                    className="w-full h-11"
                  >
                    {isChangingPassword ? <Loading01Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cambiar contraseña
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setRecoveryStep("correo")}
                    className="w-full"
                  >
                    <ArrowLeft01Icon className="mr-1 h-4 w-4" />
                    Volver
                  </Button>
                </div>
              )}
            </div>
          ) : (
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
                <div className="group space-y-2.5">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold tracking-wide"
                  >
                    Correo electrónico
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
                    <p className="text-xs font-medium text-destructive">
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
                <div className="group space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-semibold tracking-wide"
                    >
                      Contraseña
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowRecovery(true)}
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
                    <p className="text-xs font-medium text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex flex-col gap-4 pt-4">
              <Button
                disabled={isLoading}
                type="submit"
                className="bg-primary hover:bg-primary/90 h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                  {isLoading ? (
                    <>
                      <Loading01Icon className="mr-2 h-5 w-5 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-muted-foreground text-sm font-medium">
                  ¿No tienes una cuenta?
                </p>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onSwitchToRegister}
                  className="hover:bg-primary/5 hover:text-primary h-11 w-full border-2 border-dashed font-bold transition-all duration-300"
                >
                  Regístrate
                </Button>
              </div>
            </div>
          </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
