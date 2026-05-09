import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PaginaNoEncontrada() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.2),transparent_38%)]" />

      <Card className="relative w-full max-w-2xl border-slate-700/70 bg-slate-900/85 p-8 text-center shadow-2xl backdrop-blur sm:p-10">
        <p className="text-sm font-semibold tracking-[0.25em] text-cyan-300">ERROR 404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          La ruta que intentaste abrir no existe o fue movida. Puedes volver al inicio
          para continuar navegando en SpaceShift.
        </p>

        <div className="mt-8">
          <Button asChild size="lg" className="bg-cyan-500 font-semibold hover:bg-cyan-400">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </Card>
    </main>
  )
}
