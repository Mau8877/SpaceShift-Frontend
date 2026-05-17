import * as React from "react"
import { useGetMisFavoritosQuery } from "../store/publicacionApi"
import { PropertyCard } from "../../home/components/PropertyCard"

export function MisFavoritosScreen() {
  const { data: publicaciones = [], isLoading, isError } = useGetMisFavoritosQuery()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
      <h1 className="text-4xl font-black text-[#161668] mb-8 dark:text-white drop-shadow-sm">Mis Favoritos</h1>
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161668]"></div>
        </div>
      )}
      
      {isError && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100">
          Error al cargar los favoritos. Por favor, intenta de nuevo.
        </div>
      )}
      
      {!isLoading && !isError && publicaciones.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Aún no tienes publicaciones favoritas. ¡Explora y guarda las que más te gusten!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publicaciones.map((publicacion: any) => (
          <PropertyCard key={publicacion.id} data={publicacion} />
        ))}
      </div>
    </div>
  )
}
