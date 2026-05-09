import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { useValidarCodigoMutation } from "@/app/features/auth/store/passwordRecoveryApi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export const Route = createFileRoute("/_public/verificar-codigo")({
  component: VerificarCodigo,
})

function VerificarCodigo() {
  const router = useRouter()
  const search = Route.useSearch()
  const correo = search.correo

  const [codigo, setCodigo] = useState("")
  const [validarCodigo, { isLoading }] = useValidarCodigoMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correo) {
      router.navigate({ to: "/recuperar-password" })
      return
    }
    try {
      await validarCodigo({ correo, codigo }).unwrap()
      toast.success("Código válido")
      router.navigate({
        to: "/cambiar-password",
        search: { correo, codigo },
      })
    } catch {
      toast.error("Código inválido o expirado")
    }
  }

  if (!correo) {
    router.navigate({ to: "/recuperar-password" })
    return null
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verificar código</CardTitle>
          <CardDescription>
            Ingresa el código de 6 dígitos que enviamos a {correo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || codigo.length !== 6}>
              {isLoading ? "Verificando..." : "Verificar código"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => router.navigate({ to: "/recuperar-password" })}
              className="text-primary hover:underline"
            >
              Solicitar nuevo código
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}