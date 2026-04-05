import { PropertyCard } from "./PropertyCard"
import { mockProperties } from "../properties/datos"
import type { SearchFilters } from "../properties/columns"

interface InmueblesListProps {
  filtro: string
  filters: SearchFilters | null
}

export const InmueblesList = ({ filtro, filters }: InmueblesListProps) => {
  const filteredProperties = mockProperties.filter((p) => {
    // 1. Filtro por categoría (Venta, Alquiler, etc.)
    if (filtro !== "" && p.category !== filtro) return false

    // Si no hay filtros de búsqueda, solo filtramos por categoría
    if (!filters) return true

    // 2. Filtro por ubicación
    if (filters.location !== "" && p.location !== filters.location) return false

    // 3. Filtro por tipo (Casa, Depto, etc.)
    if (filters.type && p.type !== filters.type) return false

    // 4. Filtro por precio
    if (p.price < filters.minPrice) return false
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false

    return true
  })

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredProperties
        .slice(0, 16) // Limitamos a 16 elementos visuales
        .map((p) => (
          <PropertyCard
            key={p.id}
            data={{
              id: p.id,
              titulo: p.name,
              descripcion: `Propiedad de prueba ID: ${p.id}. Detalles generados por mock.`,
              ubicacion: p.location,
              precio: p.price,
              estado: p.status === "processed" ? "Disponible" : "Ocupado",
              categoria: p.category,
            }}
          />
        ))}
    </div>
  )
}
