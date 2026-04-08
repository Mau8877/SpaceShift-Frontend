import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { PropertyCardThumbnail } from "./property-card-parts"
import { PropertyCardPagination } from "./property-card-pagination"

interface PropertyCardMediaProps {
  imagenes: string[]
  titulo: string
  children?: React.ReactNode
}

export function PropertyCardMedia({
  imagenes,
  titulo,
  children
}: PropertyCardMediaProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <Carousel setApi={setApi} className="w-full">
      <PropertyCardThumbnail>
        <CarouselContent className="-ml-0">
          {imagenes.map((src, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={src}
                  alt={`${titulo} - ${index + 1}`}
                  className="aspect-[3/4] h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Elementos Flotantes (Badges y Acciones) */}
        {children}

        {/* Navegación - Solo flechas */}
        <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CarouselPrevious className="relative left-0 border-white/20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md" />
          <CarouselNext className="relative right-0 border-white/20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md" />
        </div>

        {/* Paginación Modularizada */}
        <PropertyCardPagination 
          api={api} 
          current={current} 
          count={imagenes.length} 
        />
      </PropertyCardThumbnail>
    </Carousel>
  )
}
