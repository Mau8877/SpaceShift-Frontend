import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { useCambiarPasswordMutation } from "@/app/features/auth/store/passwordRecoveryApi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export const Route = createFileRoute("/_public/cambiar-password")({
  component: CambiarPassword,
})

function CambiarPassword() {
  const router = useRouter()
  const search = Route.useSearch()
  const { correo, codigo } = search

  const [nuevaPassword, setNuevaPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [cambiarPassword, { isLoading }] = useCambiarPasswordMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correo || !codigo) {
      router.navigate({ to: "/recuperar-password" })
      return
    }
    if (nuevaPassword !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    if (nuevaPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    try {
      await cambiarPassword({ correo, codigo, nuevaPassword }).unwrap()
      toast.success("Contraseña actualizada", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña",
      })
      router.navigate({ to: "/login" })
    } catch {
      toast.error("Error", {
        description: "No se pudo cambiar la contraseña. Solicita un nuevo código.",
      })
    }
  }

  if (!correo || !codigo) {
    router.navigate({ to: "/recuperar-password" })
    return null
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Nueva contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}