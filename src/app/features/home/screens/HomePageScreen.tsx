import { useState } from "react"
import { FiltrosTipoInmueble, InmueblesList, HomeSearchBar } from "../components"
import type { SearchFilters } from "../properties/columns"

export const HomePageScreen = () => {
  const [filtro, setFiltro] = useState<string>("")
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null)

  // Mapeo dinámico de IDs a Títulos visuales
  const mapping: Record<string, string> = {
    VENTA: "en venta",
    ALQUILER: "en alquiler",
    ANTICRETICO: "en anticrético",
    ALOJAMIENTO: "para alojamiento",
  }
  
  const tituloVisual = filtro ? (mapping[filtro] || "disponibles") : "disponibles"

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      {/* Pasamos el estado y la función para cambiarlo */}
      <FiltrosTipoInmueble value={filtro} onFilterChange={setFiltro} />
      <HomeSearchBar onSearch={setActiveFilters} />

      <div className="mx-auto mt-6 w-full max-w-screen-xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Explora inmuebles {tituloVisual}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {filtro
            ? `Explora inmuebles ${tituloVisual} disponibles ahora.`
            : "Explora todas las propiedades disponibles."}
        </p>

        {/* Mapeo de inmuebles delegado al nuevo subcomponente */}
        <InmueblesList filtro={filtro} filters={activeFilters} />
      </div>
    </div>
  )
}

