import * as React from "react"
import {
  Building03Icon,
} from "hugeicons-react"
import {
  PropertyCardRoot,
  PropertyCardBadge,
  PropertyCardContent,
  PropertyCardFooter,
  PropertyCardButton,
} from "@/components/ui/property-card-parts"
import { PropertyCardMedia } from "@/components/ui/property-card-media"
import { Link, useNavigate } from "@tanstack/react-router"

export function DashboardPropertyCard({ property }: { property: any }) {
  const navigate = useNavigate()

  // Extraer URLs de las imágenes de la publicación
  const imagenes = property.imagenes?.length
    ? property.imagenes.map((img: any) => img.urlImage)
    : [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
    ]

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate({
      to: "/publicar",
      search: { edit: property.id }
    })
  }

  return (
    <PropertyCardRoot>
      <PropertyCardMedia imagenes={imagenes} titulo={property.titulo}>
        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <PropertyCardBadge variant="navy">{property.tipoTransaccion}</PropertyCardBadge>
          <PropertyCardBadge variant="gold">{property.estadoPublicacion}</PropertyCardBadge>
          <PropertyCardBadge variant="navy">{property.inmueble.estadoOperativo}</PropertyCardBadge>
        </div>
      </PropertyCardMedia>

      <PropertyCardContent
        location={property.inmueble?.ubicacion?.zonaBarrios || property.inmueble?.ubicacion?.ciudad || "Sin ubicación"}
        locationIcon={Building03Icon}
        title={property.titulo}
        price={`${property.moneda} ${property.precio.toLocaleString()}`}
      />

      <PropertyCardFooter>
        <div className="grid w-full grid-cols-2 gap-3">
          <Link to="/publicacion/$id" params={{ id: property.id }} className="w-full">
            <PropertyCardButton>Ver Detalle</PropertyCardButton>
          </Link>
          
          <PropertyCardButton onClick={handleEdit}>
            Editar
          </PropertyCardButton>
        </div>
      </PropertyCardFooter>
    </PropertyCardRoot>
  )
}
