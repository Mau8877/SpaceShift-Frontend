import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { useSolicitarRecuperacionMutation } from "@/app/features/auth/store/passwordRecoveryApi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export const Route = createFileRoute("/_public/recuperar-password")({
  component: RecuperarPassword,
})

function RecuperarPassword() {
  const router = useRouter()
  const [correo, setCorreo] = useState("")
  const [solicitarRecuperacion, { isLoading }] = useSolicitarRecuperacionMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await solicitarRecuperacion({ correo }).unwrap()
      toast.success("Código enviado", {
        description: "Revisa tu correo para obtener el código de recuperación",
      })
      router.navigate({
        to: "/verificar-codigo",
        search: { correo },
      })
    } catch {
      toast.error("Error", {
        description: "No se pudo enviar el código. Verifica el correo ingresado.",
      })
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos un código de verificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar código"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => router.navigate({ to: "/login" })}
              className="text-primary hover:underline"
            >
              Volver al login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}