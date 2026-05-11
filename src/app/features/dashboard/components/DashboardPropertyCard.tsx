import * as React from "react"
import {
  Building03Icon,
  Delete02Icon,
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
import { useEliminarPublicacionMutation } from "../../publicaciones/store/publicacionApi"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DashboardPropertyCard({ property }: { property: any }) {
  const navigate = useNavigate()
  const [eliminarPublicacion, { isLoading: isDeleting }] = useEliminarPublicacionMutation()

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

  const handleDelete = async () => {
    try {
      await eliminarPublicacion(property.id).unwrap()
      toast.success("Publicación eliminada correctamente")
    } catch (error) {
      toast.error("Error al eliminar la publicación")
    }
  }

  return (
    <PropertyCardRoot>
      <PropertyCardMedia imagenes={imagenes} titulo={property.titulo}>
        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <PropertyCardBadge variant="navy">{property.tipoTransaccion}</PropertyCardBadge>
          <PropertyCardBadge variant="gold">{property.estadoPublicacion}</PropertyCardBadge>
        </div>

        {/* Delete Action with AlertDialog */}
        <div className="absolute top-5 right-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="p-2 bg-white/20 hover:bg-red-500 backdrop-blur-md rounded-xl text-white transition-all duration-300 border border-white/30"
                title="Eliminar publicación"
              >
                <Delete02Icon size={18} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará la publicación "{property.titulo}". No podrás deshacer este cambio una vez confirmado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Sí, eliminar publicación"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
