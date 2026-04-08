import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  HelpCircleIcon,
  Loading01Icon,
  LockPasswordIcon,
  Mail01Icon,
  UserAdd01Icon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
} from "hugeicons-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RegisterModalProps {
  isOpen?: boolean
  onClose?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterModal({
  isOpen = false,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [registerUser, { isLoading }] = useRegisterMutation()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const schema = getRegisterSchema(t)

  const [tipoCliente, setTipoCliente] = useState<"PERSONAL" | "EMPRESA">(
    "PERSONAL"
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      } catch (error) { }
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
      <DialogContent className="overflow-hidden p-0 sm:max-w-[425px]">
        <div className="bg-primary/5 absolute top-0 left-0 h-1 w-full" />
        <div className="px-6 pt-8 pb-4">
          <DialogHeader className="flex flex-col items-center gap-2 text-center">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {t("header.register.title")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80 max-w-[280px]">
                {t("header.register.descripcion")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-8">
          {/* Switch de Tipo de Cuenta con Tabs */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Tabs
              value={tipoCliente}
              onValueChange={(val) => {
                const newType = val as "PERSONAL" | "EMPRESA"
                setTipoCliente(newType)
                form.setFieldValue(
                  "apellido",
                  newType === "EMPRESA" ? null : ""
                )
              }}
              className="w-full"
            >
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                <TabsTrigger
                  value="PERSONAL"
                  className="rounded-lg text-sm font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t("header.register.personal")}
                </TabsTrigger>
                <TabsTrigger
                  value="EMPRESA"
                  className="rounded-lg text-sm font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t("header.register.empresa")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
              validators={{ onChange: zodValidator("nombre") }}
              children={(field) => (
                <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2 delay-75 duration-500">
                  <Label htmlFor={field.name} className="text-sm font-semibold">
                    {tipoCliente === "EMPRESA"
                      ? t("header.register.razon-social")
                      : t("header.register.nombre")}
                  </Label>
                  <div className="relative">
                    <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                      <UserIcon className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                      placeholder={
                        tipoCliente === "EMPRESA"
                          ? "Nombre de la empresa"
                          : "Tu nombre"
                      }
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2 delay-100 duration-500">
                    <Label htmlFor={field.name} className="text-sm font-semibold">
                      {t("header.register.apellido.titulo")}
                    </Label>
                    <div className="relative">
                      <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                        <UserIcon className="h-4.5 w-4.5" />
                      </div>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading}
                        placeholder="Tu apellido"
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
              />
            )}

            {/* Correo */}
            <form.Field
              name="correo"
              validators={{ onChange: zodValidator("correo") }}
              children={(field) => (
                <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2 delay-150 duration-500">
                  <Label htmlFor={field.name} className="text-sm font-semibold">
                    {t("header.login.correo")}
                  </Label>
                  <div className="relative">
                    <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                      <Mail01Icon className="h-4.5 w-4.5" />
                    </div>
                    <Input
                      id={field.name}
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
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Password */}
              <form.Field
                name="password"
                validators={{ onChange: zodValidator("password") }}
                children={(field) => (
                  <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2 delay-200 duration-500">
                    <Label htmlFor={field.name} className="text-sm font-semibold">
                      {t("header.login.contrasena")}
                    </Label>
                    <div className="relative">
                      <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                        <LockPasswordIcon className="h-4.5 w-4.5" />
                      </div>
                      <Input
                        id={field.name}
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 group space-y-2 delay-250 duration-500">
                    <Label htmlFor={field.name} className="text-sm font-semibold">
                      {t("header.register.confirmar-contrasena")}
                    </Label>
                    <div className="relative">
                      <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-primary">
                        <LockPasswordIcon className="h-4.5 w-4.5" />
                      </div>
                      <Input
                        id={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading}
                        placeholder="••••••••"
                        className="h-11 border-border/60 bg-muted/30 focus-visible:ring-primary/20 transition-all duration-300 px-10 focus:ring-4"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
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
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 pt-6 delay-300 duration-500">
              <Button
                disabled={isLoading}
                type="submit"
                className="bg-primary hover:bg-primary/90 h-11 w-full text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loading01Icon className="mr-2 h-5 w-5 animate-spin" />
                    {t("header.register.creando-cuenta")}
                  </>
                ) : (
                  t("header.register.registrarse")
                )}
              </Button>

              <div className="flex flex-col items-center gap-3 pt-6">
                <p className="text-muted-foreground text-sm font-medium">
                  ¿Ya tienes una cuenta?
                </p>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onSwitchToLogin}
                  className="hover:bg-primary/5 hover:text-primary h-11 w-full border-2 border-dashed font-bold transition-all duration-300"
                >
                  Inicia sesión aquí
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
