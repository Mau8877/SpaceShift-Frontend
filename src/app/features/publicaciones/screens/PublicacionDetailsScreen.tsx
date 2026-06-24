import { lazy, Suspense, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { useCreateChatMutation } from "@/app/store/api/chatApi"
import { openChatWithConversation } from "@/app/store/chatUiSlice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate, useParams } from "@tanstack/react-router"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import {
  ArrowLeft01Icon,
  Bathtub01Icon,
  BedIcon,
  Building03Icon,
  CpuIcon,
  FavouriteIcon,
  GarageIcon,
  Message01Icon,
  AlertCircleIcon,
  SentIcon,
  Share01Icon,
  Square01Icon,
} from "hugeicons-react"
import { toast } from "sonner"
import { useGetPublicacionByIdQuery } from "../store/publicacionApi"

// Carga solo en cliente: leaflet asume `window` apenas se importa y rompe el render SSR
const PropertyLocationMap = lazy(() => import("../components/PropertyLocationMap"))

export function PublicacionDetailsScreen() {
  const { id } = useParams({ from: "/_public/publicacion/$id" })
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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
        description:
          err?.data?.message || "No se pudo conectar con el propietario.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container animate-pulse space-y-8 py-10">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !publicacion) {
    return (
      <div className="container space-y-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Inmueble no encontrado</h2>
        <p className="text-muted-foreground">
          La publicación que buscas no existe o ha sido dada de baja.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Volver al inicio</Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-7xl space-y-8 py-6 md:py-10"
    >
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft01Icon className="h-5 w-5" />
          <span>Volver</span>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-sm"
          >
            <Share01Icon className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-sm hover:text-red-500"
          >
            <FavouriteIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="group relative overflow-hidden rounded-[32px] bg-muted shadow-2xl">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {publicacion.imagenes.map((img: any, i: number) => (
              <div
                key={i}
                className="relative h-[300px] min-w-0 flex-[0_0_100%] md:h-[500px]"
              >
                <img
                  src={img.urlImage}
                  alt={publicacion.titulo}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Badges Over Image */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <Badge className="bg-primary px-4 py-1.5 text-sm font-bold shadow-lg hover:bg-primary">
            {publicacion.tipoTransaccion}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center border-none bg-background/90 px-4 py-1.5 text-sm font-bold text-foreground shadow-lg backdrop-blur-md"
          >
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />
            {publicacion.estadoPublicacion}
          </Badge>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Title & Location */}
          <section className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl leading-tight font-black tracking-tight md:text-4xl">
                {publicacion.titulo}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building03Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {publicacion.inmueble.ubicacion.zonaBarrios},{" "}
                  {publicacion.inmueble.ubicacion.ciudad}
                </span>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-4 text-center backdrop-blur-sm">
                <Square01Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium tracking-tighter text-muted-foreground uppercase">
                  Área
                </span>
                <span className="text-sm font-bold">
                  {publicacion.inmueble.areaConstruida} m²
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-4 text-center backdrop-blur-sm">
                <BedIcon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium tracking-tighter text-muted-foreground uppercase">
                  Habs.
                </span>
                <span className="text-sm font-bold">
                  {publicacion.inmueble.habitaciones}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-4 text-center backdrop-blur-sm">
                <Bathtub01Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium tracking-tighter text-muted-foreground uppercase">
                  Baños
                </span>
                <span className="text-sm font-bold">
                  {publicacion.inmueble.banos}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-4 text-center backdrop-blur-sm">
                <GarageIcon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium tracking-tighter text-muted-foreground uppercase">
                  Garajes
                </span>
                <span className="text-sm font-bold">
                  {publicacion.inmueble.garajes}
                </span>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold">Acerca del inmueble</h3>
            <p className="leading-relaxed text-balance text-muted-foreground">
              {publicacion.descripcionGeneral}
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold">Detalles adicionales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3">
                <span className="text-sm text-muted-foreground">
                  Precio por m²
                </span>
                <span className="text-sm font-bold">
                  {publicacion.moneda}{" "}
                  {(
                    publicacion.precio / publicacion.inmueble.areaConstruida
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3">
                <span className="text-sm text-muted-foreground">
                  Antigüedad
                </span>
                <span className="text-sm font-bold">
                  {publicacion.inmueble.antiguedadAnios} años
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3">
                <span className="text-sm text-muted-foreground">
                  Tipo Inmueble
                </span>
                <span className="text-sm font-bold uppercase">
                  {publicacion.inmueble.tipoInmueble}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3">
                <span className="text-sm text-muted-foreground">
                  Área del Terreno
                </span>
                <span className="text-sm font-bold">
                  {publicacion.inmueble.areaTerreno} m²
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3">
                <span className="text-sm text-muted-foreground">Publicado</span>
                <span className="text-sm font-bold">
                  {new Date(publicacion.fechaPublicacion).toLocaleDateString()}
                </span>
              </div>
            </div>
          </section>

          {/* Dispositivos Disponibles */}
          {publicacion.inmueble.dispositivos && publicacion.inmueble.dispositivos.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold">Dispositivos disponibles</h3>
              <p className="text-sm text-muted-foreground">
                El propietario ofrece los siguientes dispositivos inteligentes que puedes incluir en tu contrato.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {publicacion.inmueble.dispositivos.map((device: any, idx: number) => (
                  <div
                    key={device.id || idx}
                    className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/20 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CpuIcon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-bold">{device.nombre}</span>
                    </div>
                    {device.descripcion && (
                      <p className="text-xs text-muted-foreground">{device.descripcion}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {device.precioPorDia != null && device.precioPorDia > 0 && (
                        <Badge variant="outline" className="text-xs font-semibold">
                          {publicacion.moneda} {device.precioPorDia}/día
                        </Badge>
                      )}
                      {device.maxHorasSeguidas != null && device.maxHorasSeguidas > 0 && (
                        <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                          Máx. {device.maxHorasSeguidas}h seguidas
                        </Badge>
                      )}
                      {device.horarioLimiteUso && (
                        <Badge variant="outline" className="text-xs border-rose-200 bg-rose-50 text-rose-700">
                          No disponible {device.horarioLimiteUso}–{device.horarioLimiteFin || "00:00"}
                        </Badge>
                      )}
                    </div>
                    {device.sancionIncumplimiento && (
                      <div className="mt-1 flex items-start gap-1.5 rounded-lg bg-rose-50/50 p-2 text-xs border border-rose-100/50 dark:bg-rose-950/20 dark:border-rose-900/30">
                        <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                        <div className="text-rose-700 dark:text-rose-300">
                          <span className="font-semibold">Sanción: </span>
                          {device.sancionIncumplimiento}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Condiciones y Restricciones */}
          {(publicacion.inmueble.condiciones || publicacion.inmueble.multasSanciones) && (
            <section className="space-y-4">
              <h3 className="text-xl font-bold">Condiciones y restricciones</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {publicacion.inmueble.condiciones && (
                  <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/20 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircleIcon className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-bold">Condiciones de uso</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {publicacion.inmueble.condiciones}
                    </p>
                  </div>
                )}
                {publicacion.inmueble.multasSanciones && (
                  <div className="flex flex-col gap-2 rounded-2xl border border-rose-200/50 bg-rose-50/30 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircleIcon className="h-5 w-5 text-rose-500" />
                      <span className="text-sm font-bold text-rose-700">Multas y sanciones</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {publicacion.inmueble.multasSanciones}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Ubicación Map Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Ubicación de la propiedad</h3>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase">
                Sector: {publicacion.inmueble.ubicacion.zonaBarrios}
              </div>
            </div>

            <div className="group z-0 h-[400px] w-full overflow-hidden rounded-[32px] border-4 border-muted shadow-2xl">
              {mounted ? (
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <PropertyLocationMap
                    latitud={Number(publicacion.inmueble.ubicacion.latitud)}
                    longitud={Number(publicacion.inmueble.ubicacion.longitud)}
                    className="h-full w-full contrast-[1.1] grayscale-[0.2] transition-all group-hover:grayscale-0"
                  />
                </Suspense>
              ) : (
                <Skeleton className="h-full w-full" />
              )}
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
              <div className="rounded-lg bg-background p-2 shadow-sm">
                <Building03Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Dirección de referencia</p>
                <p className="text-sm text-muted-foreground">
                  {publicacion.inmueble.ubicacion.direccionExacta}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Side Card */}
        <div className="lg:relative">
          <Card className="sticky top-24 overflow-hidden border-2 border-primary/10 bg-background shadow-xl">
            <div className="space-y-6 p-6">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Precio de {publicacion.tipoTransaccion.toLowerCase()}
                </span>
                <div className="text-3xl font-black text-primary">
                  {publicacion.moneda} {publicacion.precio.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="h-14 w-full gap-3 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  onClick={handleContactOwner}
                  disabled={isCreatingChat}
                >
                  <Message01Icon className="h-6 w-6" />
                  {isCreatingChat ? "Iniciando..." : "Contactar Propietario"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full gap-3 border-2 font-semibold"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error("Autenticación requerida", {
                        description: "Inicia sesión para hacer una oferta.",
                      })
                      return
                    }
                    navigate({
                      to: "/crear-oferta/$id",
                      params: { id },
                    })
                  }}
                >
                  <SentIcon className="h-5 w-5" />
                  Hacer una oferta
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="h-12 w-full gap-3 border-2 font-semibold"
                  onClick={() =>
                    navigate({
                      to: "/publicacion-tour-3d/$id",
                      params: { id },
                    })
                  }
                >
                  <Building03Icon className="h-5 w-5" />
                  Ver recorrido 3D
                </Button>
              </div>

              <Separator className="bg-border/50" />

              <div className="group flex cursor-pointer items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 font-bold text-primary">
                  JS
                </div>
                <div className="flex-1">
                  <div className="font-bold transition-colors group-hover:text-primary">
                    Agente Inmobiliario
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Activo hace 5 min
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 text-center">
              <p className="px-4 text-[10px] leading-tight font-medium tracking-widest text-muted-foreground uppercase">
                Seguridad garantizada por SpaceShift AR
              </p>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
