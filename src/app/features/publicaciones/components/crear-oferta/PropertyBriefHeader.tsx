import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PropertyBriefHeaderProps {
  publicacion: any
  moneda: string
  precioBase: number
  isRental: boolean
}

export function PropertyBriefHeader({
  publicacion,
  moneda,
  precioBase,
  isRental,
}: PropertyBriefHeaderProps) {
  const imageUrl = publicacion.imagenes?.[0]?.urlImage

  return (
    <Card className="overflow-hidden border-2 border-primary/10 bg-background shadow-lg">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={publicacion.titulo}
            className="h-24 w-36 rounded-2xl object-cover shadow-md"
          />
        )}
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold">{publicacion.titulo}</h3>
          <p className="text-sm text-muted-foreground">
            {publicacion.inmueble.ubicacion?.zonaBarrios},{" "}
            {publicacion.inmueble.ubicacion?.ciudad}
          </p>
          <div className="flex gap-2">
            <Badge className="bg-primary px-3 py-1 text-xs font-bold hover:bg-primary">
              {publicacion.tipoTransaccion}
            </Badge>
            <Badge variant="outline" className="text-xs font-semibold">
              {moneda} {precioBase.toLocaleString()}{isRental ? "/mes" : ""}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
