import { useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Album02Icon, Coins01Icon, Video01Icon } from "hugeicons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useAppDispatch } from "@/app/store/hooks"

import {
  iniciarSubidaVideo,
  useCotizarVideoQuery,
  useGetVideosByPublicacionQuery,
} from "../store"
import type {
  EstadoProcesamiento,
  VideoFileMeta,
  VideoPublicacionDTO,
} from "../types"

function getVideoMeta(file: File): Promise<VideoFileMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      const partes = file.name.split(".")
      const extension = partes.length > 1 ? `.${partes.pop()}` : ".mp4"
      resolve({
        nombre: file.name,
        tamanoBytes: file.size,
        duracionSegundos: Math.max(1, Math.ceil(video.duration || 0)),
        extension,
      })
    }
    video.onerror = () => reject(new Error("No se pudo leer el video."))
    video.src = URL.createObjectURL(file)
  })
}

const ESTADO_BADGE: Record<EstadoProcesamiento, string> = {
  PENDIENTE: "bg-slate-400 hover:bg-slate-400",
  PROCESANDO: "bg-amber-500 hover:bg-amber-500",
  COMPLETADO: "bg-green-500 hover:bg-green-500",
  FALLIDO: "bg-red-500 hover:bg-red-500",
}

export function SubirVideoDialog({
  idPublicacion,
  trigger,
}: {
  idPublicacion: string
  trigger: React.ReactNode
}) {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<VideoFileMeta | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { data: videosExistentes = [] } = useGetVideosByPublicacionQuery(
    idPublicacion,
    { skip: !open }
  )

  const { data: cotizacion, isFetching: cotizando } = useCotizarVideoQuery(
    meta?.duracionSegundos ?? 0,
    { skip: !meta }
  )

  const reset = () => {
    setFile(null)
    setMeta(null)
    setErrorMsg(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setErrorMsg(null)
    setFile(f)
    try {
      setMeta(await getVideoMeta(f))
    } catch {
      setErrorMsg("No se pudo leer la duración del video. Prueba con otro archivo.")
      setFile(null)
      setMeta(null)
    }
  }

  const handleProcesar = () => {
    if (!file || !meta || !cotizacion?.saldoSuficiente) return
    // Disparamos el flujo en segundo plano (sobrevive al cierre del modal).
    dispatch(iniciarSubidaVideo({ idPublicacion, file, meta }))
    toast.success("Subida iniciada", {
      description: "Verás el progreso abajo a la derecha. Puedes cerrar esta ventana.",
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video01Icon className="h-5 w-5 text-primary" />
            Recorrido 3D
          </DialogTitle>
          <DialogDescription>
            Sube un video del inmueble para generar un modelo 3D navegable. El
            costo se cobra en créditos según la duración del video.
          </DialogDescription>
        </DialogHeader>

        {/* Videos existentes */}
        {videosExistentes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Recorridos existentes</p>
            {videosExistentes.map((v: VideoPublicacionDTO) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 p-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Album02Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{v.nombreArchivo}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className={ESTADO_BADGE[v.estadoProcesamiento]}>
                    {v.estadoProcesamiento}
                  </Badge>
                  {v.estadoProcesamiento === "COMPLETADO" && (
                    <Link
                      to="/publicacion-tour-3d/$id"
                      params={{ id: idPublicacion }}
                    >
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <Separator className="my-2" />
          </div>
        )}

        {/* Selección de archivo + cotización */}
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFile}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
          />

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          {meta && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Archivo</span>
                <span className="max-w-[60%] truncate font-medium">
                  {meta.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración</span>
                <span className="font-medium">{meta.duracionSegundos}s</span>
              </div>

              {cotizando && (
                <p className="text-muted-foreground">Calculando costo...</p>
              )}

              {cotizacion && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Coins01Icon className="h-4 w-4" /> Costo
                    </span>
                    <span className="font-bold">
                      {cotizacion.costoCreditos} créditos
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tu saldo</span>
                    <span className="font-medium">
                      {cotizacion.saldoActual} créditos
                    </span>
                  </div>
                  {!cotizacion.saldoSuficiente && (
                    <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">
                      Saldo insuficiente.{" "}
                      <Link to="/creditos" className="font-semibold underline">
                        Comprar créditos
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <Button
            className="w-full"
            disabled={
              !meta || !cotizacion || !cotizacion.saldoSuficiente || cotizando
            }
            onClick={handleProcesar}
          >
            {cotizacion
              ? `Procesar (${cotizacion.costoCreditos} créditos)`
              : "Procesar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
