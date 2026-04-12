import * as React from "react"
import { motion } from "framer-motion"
import { useParams, useNavigate } from "@tanstack/react-router"
import { 
  useGetPublicacionByIdQuery 
} from "../store/publicacionApi"
import { useCreateChatMutation } from "@/app/store/api/chatApi"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { openChatWithConversation } from "@/app/store/chatUiSlice"
import { 
  Building03Icon, 
  Square01Icon, 
  BedIcon, 
  Bathtub01Icon, 
  GarageIcon,
  Message01Icon,
  ArrowLeft01Icon,
  Share01Icon,
  FavouriteIcon,
  SentIcon
} from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import useEmblaCarousel from "embla-carousel-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function PublicacionDetailsScreen() {
  const { id } = useParams({ from: "/_public/publicacion/$id" })
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  const { data: publicacion, isLoading, error } = useGetPublicacionByIdQuery(id)
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation()

  const [emblaRef] = useEmblaCarousel({ loop: true })

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      toast.error("Autenticación requerida", {
        description: "Inicia sesión para contactar al propietario.",
      })
      // Aquí se podría abrir el modal de login si existiera una acción global
      return
    }

    try {
      const conversation = await createChat({ publicacionId: id }).unwrap()
      dispatch(openChatWithConversation(conversation.conversacionId))
      toast.success("Chat iniciado", {
        description: `Conectando con el anunciante...`,
      })
    } catch (err: any) {
      toast.error("Error al iniciar chat", {
        description: err?.data?.message || "No se pudo conectar con el propietario.",
      })
    }
  }

  if (isLoading) {
    return <div className="container py-10 space-y-8 animate-pulse">
      <Skeleton className="h-[400px] w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  }

  if (error || !publicacion) {
    return <div className="container py-20 text-center space-y-4">
      <h2 className="text-2xl font-bold">Inmueble no encontrado</h2>
      <p className="text-muted-foreground">La publicación que buscas no existe o ha sido dada de baja.</p>
      <Button onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
    </div>
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-6 md:py-10 max-w-7xl mx-auto space-y-8"
    >
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => navigate({ to: ".." })}>
          <ArrowLeft01Icon className="h-5 w-5" />
          <span>Volver</span>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm">
            <Share01Icon className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:text-red-500">
            <FavouriteIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="relative group overflow-hidden rounded-[32px] shadow-2xl bg-muted">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {publicacion.imagenes.map((img: any, i: number) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 relative h-[300px] md:h-[500px]">
                <img 
                  src={img.urlImage} 
                  alt={publicacion.titulo}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Badges Over Image */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <Badge className="bg-primary hover:bg-primary px-4 py-1.5 text-sm font-bold shadow-lg">
            {publicacion.tipoTransaccion}
          </Badge>
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md px-4 py-1.5 text-sm font-bold shadow-lg border-none">
            {publicacion.estadoPublicacion}
          </Badge>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Location */}
          <section className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {publicacion.titulo}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building03Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{publicacion.inmueble.ubicacion.zonaBarrios}, {publicacion.inmueble.ubicacion.ciudad}</span>
              </div>
            </div>

            <Separator className="bg-border/50" />
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/50 backdrop-blur-sm">
                <Square01Icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Área</span>
                <span className="font-bold text-sm">{publicacion.inmueble.areaConstruida} m²</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/50 backdrop-blur-sm">
                <BedIcon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Habs.</span>
                <span className="font-bold text-sm">{publicacion.inmueble.habitaciones}</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/50 backdrop-blur-sm">
                <Bathtub01Icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Baños</span>
                <span className="font-bold text-sm">{publicacion.inmueble.banos}</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/50 backdrop-blur-sm">
                <GarageIcon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Garajes</span>
                <span className="font-bold text-sm">{publicacion.inmueble.garajes}</span>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">Acerca del inmueble</h3>
            <p className="text-muted-foreground leading-relaxed text-balance">
              {publicacion.descripcionGeneral}
            </p>
          </section>

          {/* Additional Info */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">Detalles adicionales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-sm text-muted-foreground">Antigüedad</span>
                <span className="font-bold text-sm">{publicacion.inmueble.antiguedadAnios} años</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-sm text-muted-foreground">Tipo Inmueble</span>
                <span className="font-bold text-sm uppercase">{publicacion.inmueble.tipoInmueble}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-sm text-muted-foreground">Área del Terreno</span>
                <span className="font-bold text-sm">{publicacion.inmueble.areaTerreno} m²</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/10 border border-border/30">
                <span className="text-sm text-muted-foreground">Fecha Publicación</span>
                <span className="font-bold text-sm">{new Date(publicacion.fechaPublicacion).toLocaleDateString()}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Side Card */}
        <div className="lg:relative">
          <Card className="sticky top-24 overflow-hidden border-2 border-primary/10 shadow-xl bg-background">
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground font-medium">Precio de {publicacion.tipoTransaccion.toLowerCase()}</span>
                <div className="text-3xl font-black text-primary">
                  {publicacion.moneda} {publicacion.precio.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full text-base font-bold gap-3 h-14 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  onClick={handleContactOwner}
                  disabled={isCreatingChat}
                >
                  <Message01Icon className="h-6 w-6" />
                  {isCreatingChat ? "Iniciando..." : "Contactar Propietario"}
                </Button>
                <Button variant="outline" size="lg" className="w-full h-12 gap-3 border-2 font-semibold">
                  <SentIcon className="h-5 w-5" />
                  Hacer una oferta
                </Button>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold">
                  JS
                </div>
                <div className="flex-1">
                  <div className="font-bold group-hover:text-primary transition-colors">Agente Inmobiliario</div>
                  <div className="text-xs text-muted-foreground">Activo hace 5 min</div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 text-center">
              <p className="text-[10px] text-muted-foreground leading-tight px-4 font-medium uppercase tracking-widest">
                Seguridad garantizada por SpaceShift AR
              </p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
