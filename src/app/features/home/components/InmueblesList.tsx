import { ExampleCard } from "@/components/layout/components/Card"
import { mockProperties } from "@/app/features/client/home copy/properties/datos"

interface InmueblesListProps {
  filtro: string
}

export const InmueblesList = ({ filtro }: InmueblesListProps) => {
  return (
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
              categoria: p.category,
            }}
          />
        ))}
    </div>
  )
}
