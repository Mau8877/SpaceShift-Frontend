import * as React from "react"
import {
  ViewIcon,
  FavouriteIcon,
  Building03Icon,
} from "hugeicons-react"
import {
  PropertyCardRoot,
  PropertyCardBadge,
  PropertyCardAction,
  PropertyCardContent,
  PropertyCardFooter,
  PropertyCardButton,
} from "@/components/ui/property-card-parts"
import { PropertyCardMedia } from "@/components/ui/property-card-media"

import type { Publicacion } from "../types/property.ts"

export function PropertyCard({ data }: { data: Publicacion }) {
  // Extraer URLs de las imágenes de la publicación
  const imagenes = data.imagenes?.length
    ? data.imagenes.map(img => img.url)
    : [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
    ]

  return (
    <PropertyCardRoot>
      <PropertyCardMedia imagenes={imagenes} titulo={data.titulo}>
        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <PropertyCardBadge variant="navy">{data.tipoTransaccion}</PropertyCardBadge>
          <PropertyCardBadge variant="gold">{data.estadoPublicacion}</PropertyCardBadge>
        </div>

        {/* Acciones */}
        <div className="absolute top-5 right-5 flex gap-2">
          <PropertyCardAction icon={ViewIcon} />
          <PropertyCardAction icon={FavouriteIcon} />
        </div>
      </PropertyCardMedia>

      <PropertyCardContent
        location={data.inmueble?.ubicacion?.zonaBarrios || "Sin ubicación"}
        locationIcon={Building03Icon}
        title={data.titulo}
        price={`${data.moneda} ${data.precio.toLocaleString()}`}
      />

      <PropertyCardFooter>
        <PropertyCardButton>Ver Detalles</PropertyCardButton>
      </PropertyCardFooter>
    </PropertyCardRoot>
  )
}


