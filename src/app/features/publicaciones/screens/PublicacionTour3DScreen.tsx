import { useNavigate, useParams } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft01Icon, Building03Icon } from "hugeicons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { SpaceSplatViewer } from "@/components/space3d/SpaceSplatViewer"
import { SpaceSogViewer } from "@/components/space3d/SpaceSogViewer"
import { useGetVideosByPublicacionQuery } from "../store"
import type { VideoPublicacionDTO } from "../types"

const CAMERA = {
  position: [0, 1.5, 4] as [number, number, number],
  lookAt: [0, 0, 0] as [number, number, number],
}

/** Elige el video a mostrar: el primer COMPLETADO con modelo; si no, el más reciente. */
function pickVideo(videos: VideoPublicacionDTO[]): VideoPublicacionDTO | null {
  if (!videos.length) return null
  const completados = videos.filter((v) => v.estadoProcesamiento === "COMPLETADO")
  return (
    completados.find((v) => v.urlSplat || v.urlSog) ??
    completados[0] ??
    videos[0]
  )
}

export function PublicacionTour3DScreen() {
  const { id } = useParams({ from: "/_public/publicacion-tour-3d/$id" })
  const navigate = useNavigate()

  const {
    data: videos,
    isLoading,
    isError,
    refetch,
  } = useGetVideosByPublicacionQuery(id)

  const video = videos ? pickVideo(videos) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto max-w-7xl space-y-8 py-6 md:py-10"
    >
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate({ to: "/publicacion/$id", params: { id } })}
        >
          <ArrowLeft01Icon className="h-5 w-5" />
          <span>Volver al inmueble</span>
        </Button>

        {video && (
          <Badge
            className={
              video.estadoProcesamiento === "COMPLETADO"
                ? "w-fit bg-green-500 hover:bg-green-500"
                : video.estadoProcesamiento === "FALLIDO"
                  ? "w-fit bg-red-500 hover:bg-red-500"
                  : "w-fit bg-amber-500 hover:bg-amber-500"
            }
          >
            {video.estadoProcesamiento}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
          Recorrido 3D del ambiente
        </h1>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Building03Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Modelo generado a partir del video de la publicación
          </span>
        </div>
      </div>

      <Separator />

      <Card className="overflow-hidden rounded-[32px] border-2 border-primary/10 bg-background shadow-2xl">
        <div className="space-y-4 p-4 md:p-6">
          {isLoading && (
            <div className="flex h-[650px] items-center justify-center rounded-[24px] bg-muted/40 text-muted-foreground">
              Cargando recorridos 3D...
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex h-[650px] flex-col items-center justify-center gap-4 rounded-[24px] bg-muted/40 text-muted-foreground">
              <p>No se pudieron cargar los recorridos 3D.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {!isLoading && !isError && !video && (
            <div className="flex h-[650px] items-center justify-center rounded-[24px] bg-muted/40 text-center text-muted-foreground">
              Esta publicación todavía no tiene un recorrido 3D.
            </div>
          )}

          {video && video.estadoProcesamiento === "PROCESANDO" && (
            <div className="flex h-[650px] items-center justify-center rounded-[24px] bg-muted/40 text-center text-muted-foreground">
              El recorrido 3D se está generando. Vuelve en unos minutos.
            </div>
          )}

          {video && video.estadoProcesamiento === "FALLIDO" && (
            <div className="flex h-[650px] items-center justify-center rounded-[24px] bg-muted/40 text-center text-muted-foreground">
              {video.errorMensaje ?? "La generación del modelo 3D falló."}
            </div>
          )}

          {video &&
            video.estadoProcesamiento === "COMPLETADO" &&
            (video.urlSplat ? (
              <SpaceSplatViewer
                modelUrl={video.urlSplat}
                previewUrl={video.urlPreviewWebp ?? undefined}
                camera={CAMERA}
                className="h-[650px] rounded-[24px]"
              />
            ) : video.urlSog ? (
              <SpaceSogViewer
                modelUrl={video.urlSog}
                previewUrl={video.urlPreviewWebp ?? undefined}
                camera={CAMERA}
                className="h-[650px] rounded-[24px]"
              />
            ) : (
              <div className="flex h-[650px] items-center justify-center rounded-[24px] bg-muted/40 text-center text-muted-foreground">
                El modelo 3D no tiene un archivo visualizable.
              </div>
            ))}

          {video && video.estadoProcesamiento === "COMPLETADO" && (
            <div className="space-y-2 rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
              {(video.urlSplat || video.urlSog) && (
                <p>
                  <strong>Modelo:</strong> {video.urlSplat ?? video.urlSog}
                </p>
              )}
              {video.urlPreviewWebp && (
                <p>
                  <strong>Preview:</strong> {video.urlPreviewWebp}
                </p>
              )}
              {video.urlJsonModelo && (
                <p>
                  <strong>Metadata:</strong> {video.urlJsonModelo}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
