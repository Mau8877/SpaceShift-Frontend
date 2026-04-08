import { useGetPublicacionesQuery } from "../store/homeApi"
import { PropertyCard } from "./PropertyCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { SearchFilters } from "../properties/columns"

interface InmueblesListProps {
  filtro: string
  filters: SearchFilters | null
}

export const InmueblesList = ({ filtro, filters }: InmueblesListProps) => {
  const { data: publicaciones, isLoading, isError } = useGetPublicacionesQuery()

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-[36px]" />
            <div className="space-y-2 px-2">
              <Skeleton className="h-4 w-2/3 mx-auto" />
              <Skeleton className="h-6 w-full mx-auto" />
              <Skeleton className="h-5 w-1/2 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mt-12 text-center py-10">
        <p className="text-slate-500 font-medium">Hubo un error al conectar con el servidor.</p>
        <p className="text-sm text-slate-400">Por favor, asegúrate de que el backend esté corriendo.</p>
      </div>
    )
  }

  const filteredProperties = (publicaciones || []).filter((p) => {
    // 1. Filtro por categoría (VENTA, ALQUILER, etc.)
    if (filtro !== "" && p.tipoTransaccion !== filtro) return false

    // Si no hay filtros de búsqueda adicionales, filtramos solo por categoría
    if (!filters) return true

    // 2. Filtro por ubicación
    if (filters.location !== "" && p.inmueble?.ubicacion?.zonaBarrios !== filters.location) return false

    // 3. Filtro por tipo (Casa, Depto, etc.)
    if (filters.type && p.inmueble?.tipoInmueble !== filters.type) return false

    // 4. Filtro por precio
    if (p.precio < (filters.minPrice || 0)) return false
    if (filters.maxPrice !== null && p.precio > filters.maxPrice) return false

    return true
  })

  if (filteredProperties.length === 0) {
    return (
      <div className="mt-12 text-center py-10 text-slate-500 border-2 border-dashed border-slate-100 rounded-[36px]">
        No se encontraron propiedades que coincidan con tu búsqueda.
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredProperties.map((p) => (
        <PropertyCard key={p.id} data={p} />
      ))}
    </div>
  )
}
