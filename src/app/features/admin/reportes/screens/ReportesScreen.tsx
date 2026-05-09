import { useAppSelector } from "@/app/store"
import { PaginaNoEncontrada } from "@/components/PaginaNoEncontrada"
import { Card } from "@/components/ui/card"

export function ReportesScreen() {
  const rol = useAppSelector((state) => state.auth.user?.rol)

  if (rol !== "ROLE_ADMIN") {
    return <PaginaNoEncontrada />
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Reportes del Sistema</h2>
        <p className="mt-1 text-sm text-slate-500">
          Visualiza métricas generales, actividad y estado del sistema.
        </p>
      </div>

      <Card className="border-slate-200 p-6">
        <p className="text-sm text-slate-600">Pantalla inicial de reportes administrativos.</p>
      </Card>
    </section>
  )
}
