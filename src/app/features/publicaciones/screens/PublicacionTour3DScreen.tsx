import { useNavigate, useParams } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft01Icon, Building03Icon } from "hugeicons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { SpaceSplatViewer } from "@/components/space3d/SpaceSplatViewer"
import { TOUR_3D_STATIC_RESULT } from "../store/tour3dMock"

export function PublicacionTour3DScreen() {
  const { id } = useParams({ from: "/_public/publicacion-tour-3d/$id" })
  const navigate = useNavigate()

  const assets = TOUR_3D_STATIC_RESULT.output.assets

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
          onClick={() =>
            navigate({
              to: "/publicacion/$id",
              params: { id },
            })
          }
        >
          <ArrowLeft01Icon className="h-5 w-5" />
          <span>Volver al inmueble</span>
        </Button>

        <Badge variant="outline" className="rounded-full px-4 py-1.5">
          Demo estática 3D
        </Badge>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
          Recorrido 3D del ambiente
        </h1>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Building03Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Modelo cargado desde S3 usando archivo .splat
          </span>
        </div>
      </div>

      <Separator />

      <Card className="overflow-hidden rounded-[32px] border-2 border-primary/10 bg-background shadow-2xl">
        <div className="space-y-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Vista interactiva</h2>
              <p className="text-sm text-muted-foreground">
                Esta prueba usa URLs estáticas de S3: preview.webp +
                model.splat.
              </p>
            </div>

            <Badge className="w-fit bg-green-500 hover:bg-green-500">
              {TOUR_3D_STATIC_RESULT.status}
            </Badge>
          </div>

          <SpaceSplatViewer
            modelUrl={assets.model}
            camera={{
              position: [0, 1.5, 4],
              lookAt: [0, 0, 0],
            }}
            className="h-[650px] rounded-[24px]"
          />

          <div className="space-y-2 rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
            <p>
              <strong>Modelo:</strong> {assets.model}
            </p>
            <p>
              <strong>Preview:</strong> {assets.preview}
            </p>
            <p>
              <strong>Metadata:</strong> {assets.metadata}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
