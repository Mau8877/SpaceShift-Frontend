import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FiltrosTipoInmueble } from "../components"
import { ExampleCard } from "@/components/layout/components/Card"//
// Importamos los datos reales / generados desde la carpeta correcta
import { mockProperties } from "@/app/features/client/home copy/properties/datos"//

export const HomePageScreen = () => {
  const { t } = useTranslation()
  const [filtro, setFiltro] = useState<string>("")

  // Mapeo de IDs a Títulos visuales
  const titulos: Record<string, string> = {
    venta: t("home.filter.venta"),
    alquiler: t("home.filter.alquiler"),
    anticretico: t("home.filter.anticretico"),
    alojamiento: t("home.filter.alojamiento"),
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      {/* Pasamos el estado y la función para cambiarlo */}
      <FiltrosTipoInmueble value={filtro} onFilterChange={setFiltro} />

      <div className="mx-auto mt-6 w-full max-w-screen-xl px-4">
        <h1 className="text-2xl font-bold text-slate-800 transition-all">
          {t("home.menu.title.inmuebles")} {filtro ? titulos[filtro] : ""}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {filtro
            ? t("home.description.cantidad", { type: titulos[filtro] })
            : t("home.description.default")}
        </p>

        {/* Mapeo de inmuebles basado en 'filtro' desde los mock data */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProperties
            .filter((p) => filtro === "" || p.category === filtro)
            .slice(0, 16) // Limitamos a 16 elementos visuales para no saturar la página inicial
            .map((p) => (
              <ExampleCard
                key={p.id}
                data={{
                  id: p.id,
                  titulo: p.name,
                  descripcion: `Propiedad de prueba ID: ${p.id}. Detalles generados por mock.`,
                  ubicacion: p.location,
                  precio: p.price,
                  estado: p.status === "processed" ? "Disponible" : "Ocupado",
                  categoria: p.category
                }}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
