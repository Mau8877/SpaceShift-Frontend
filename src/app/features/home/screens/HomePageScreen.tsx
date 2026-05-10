import { useState } from "react"
import { FiltrosTipoInmueble, InmueblesList, HomeSearchBar } from "../components"
import type { SearchFilters } from "../properties/columns"

export const HomePageScreen = () => {
  const [filtro, setFiltro] = useState<string>("")
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null)

  // Mapeo de IDs a Títulos visuales
  const titulos: Record<string, string> = {
    venta: "en venta",
    alquiler: "en alquiler",
    anticretico: "en anticrético",
    alojamiento: "para alojamiento",
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      {/* Pasamos el estado y la función para cambiarlo */}
      <FiltrosTipoInmueble value={filtro} onFilterChange={setFiltro} />
      <HomeSearchBar onSearch={setActiveFilters} />

      <div className="mx-auto mt-6 w-full max-w-screen-xl px-4">
        <h1 className="text-2xl font-bold text-slate-800 transition-all">
          Inmuebles {filtro ? titulos[filtro] : ""}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {filtro
            ? `Explora inmuebles ${titulos[filtro]} disponibles ahora.`
            : "Explora todas las propiedades disponibles."}
        </p>

        {/* Mapeo de inmuebles delegado al nuevo subcomponente */}
        <InmueblesList filtro={filtro} filters={activeFilters} />
      </div>
    </div>
  )
}

