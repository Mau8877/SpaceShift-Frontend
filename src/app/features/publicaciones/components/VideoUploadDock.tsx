import { Link } from "@tanstack/react-router"
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Video01Icon,
} from "hugeicons-react"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import {
  selectVideoUploads,
  uploadDismissed,
  type VideoUploadItem,
} from "@/app/store/videoUploadSlice"

function faseTexto(item: VideoUploadItem): string {
  switch (item.phase) {
    case "subiendo":
      return `Subiendo video... ${item.progress}%`
    case "registrando":
      return "Registrando y cobrando créditos..."
    case "procesando":
      return "Generando el modelo 3D..."
    case "completado":
      return "¡Recorrido 3D listo!"
    case "error":
      return item.error ?? "Error al procesar el video."
  }
}

function UploadCard({ item }: { item: VideoUploadItem }) {
  const dispatch = useAppDispatch()
  const terminado = item.phase === "completado" || item.phase === "error"

  return (
    <div className="w-80 rounded-xl border bg-background p-3 shadow-lg">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">
          {item.phase === "completado" ? (
            <CheckmarkCircle02Icon className="h-5 w-5 text-green-500" />
          ) : item.phase === "error" ? (
            <Alert02Icon className="h-5 w-5 text-red-500" />
          ) : item.phase === "subiendo" ? (
            <Video01Icon className="h-5 w-5 text-primary" />
          ) : (
            <Loading03Icon className="h-5 w-5 animate-spin text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.nombreArchivo}</p>
          <p
            className={`text-xs ${
              item.phase === "error" ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {faseTexto(item)}
          </p>
        </div>

        {terminado && (
          <button
            onClick={() => dispatch(uploadDismissed(item.id))}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
            title="Cerrar"
          >
            <Cancel01Icon className="h-4 w-4" />
          </button>
        )}
      </div>

      {item.phase === "subiendo" && (
        <Progress value={item.progress} className="mt-2" />
      )}

      {item.phase === "completado" && (
        <Link
          to="/publicacion-tour-3d/$id"
          params={{ id: item.idPublicacion }}
          className="mt-2 block"
        >
          <Button size="sm" className="w-full">
            Ver recorrido 3D
          </Button>
        </Link>
      )}
    </div>
  )
}

/**
 * Pila fija abajo a la derecha que muestra el progreso de las subidas/procesamiento
 * de videos. Vive en el root, por lo que sobrevive al cierre del modal.
 */
export function VideoUploadDock() {
  const uploads = useAppSelector(selectVideoUploads)

  if (uploads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {uploads.map((item) => (
        <UploadCard key={item.id} item={item} />
      ))}
    </div>
  )
}
