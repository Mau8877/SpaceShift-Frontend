import { useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  Album02Icon,
  Coins01Icon,
  Upload01Icon,
  Video01Icon,
  Wallet02Icon,
} from "hugeicons-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAppDispatch } from "@/app/store/hooks"
import { useGetMiSaldoQuery } from "@/app/features/tokens/store/tokenApi"

import {
  iniciarSubidaVideo,
  useCotizarVideoQuery,
  useGetVideosByPublicacionQuery,
} from "../store"
import type {
  EstadoProcesamiento,
  Formato3D,
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const ESTADO_BADGE: Record<EstadoProcesamiento, string> = {
  PENDIENTE: "bg-slate-400 hover:bg-slate-400",
  PROCESANDO: "bg-amber-500 hover:bg-amber-500",
  COMPLETADO: "bg-green-500 hover:bg-green-500",
  FALLIDO: "bg-red-500 hover:bg-red-500",
}

const FORMATO_INFO: Record<Formato3D, string> = {
  SPLAT: "Máxima calidad · archivo más pesado · más caro",
  SOG: "Más ligero · algo menos de calidad · más barato",
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formato, setFormato] = useState<Formato3D>("SPLAT")
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { data: videosExistentes = [] } = useGetVideosByPublicacionQuery(
    idPublicacion,
    { skip: !open }
  )

  const { data: saldo } = useGetMiSaldoQuery(undefined, { skip: !open })

  const { data: cotizacion, isFetching: cotizando } = useCotizarVideoQuery(
    { duracionSegundos: meta?.duracionSegundos ?? 0, formato },
    { skip: !meta }
  )

  const reset = () => {
    setFile(null)
    setMeta(null)
    setErrorMsg(null)
    setFormato("SPLAT")
    setIsDragging(false)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const processFile = async (f: File) => {
    if (!f.type.startsWith("video/")) {
      setErrorMsg("El archivo debe ser un video.")
      return
    }
    setErrorMsg(null)
    setFile(f)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
    try {
      setMeta(await getVideoMeta(f))
    } catch {
      setErrorMsg("No se pudo leer la duración del video. Prueba con otro archivo.")
      setFile(null)
      setMeta(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) void processFile(f)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) void processFile(f)
  }

  const handleProcesar = () => {
    if (!file || !meta || !cotizacion?.saldoSuficiente) return
    // Disparamos el flujo en segundo plano (sobrevive al cierre del modal).
    dispatch(iniciarSubidaVideo({ idPublicacion, file, meta, formato }))
    toast.success("Subida iniciada", {
      description: "Verás el progreso abajo a la derecha. Puedes cerrar esta ventana.",
    })
    handleOpenChange(false)
  }

  const saldoMostrado = cotizacion?.saldoActual ?? saldo?.saldoCreditos

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video01Icon className="h-5 w-5 text-primary" />
            Generar modelo 3D
          </DialogTitle>
          <DialogDescription>
            Sube un video del inmueble para generar un recorrido 3D navegable.
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

        <div className="space-y-4">
          {/* Zona de subida (drag & drop / click) */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">Video del inmueble</p>
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleInputChange}
                className="hidden"
              />

              {previewUrl ? (
                <video
                  src={previewUrl}
                  muted
                  playsInline
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Upload01Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                {meta ? (
                  <>
                    <p className="truncate text-sm font-medium">{meta.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.duracionSegundos}s · {formatBytes(meta.tamanoBytes)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Arrastra y suelta el video
                    </p>
                    <p className="text-xs text-muted-foreground">
                      o haz clic para seleccionarlo
                    </p>
                  </>
                )}
              </div>
            </label>
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          </div>

          {/* Formato de salida */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">Formato de salida</p>
            <Select
              value={formato}
              onValueChange={(v) => setFormato(v as Formato3D)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPLAT">Splat (alta calidad)</SelectItem>
                <SelectItem value="SOG">Sog (ligero)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {FORMATO_INFO[formato]}
            </p>
          </div>

          {/* Costo de procesamiento */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Coins01Icon className="h-4 w-4" /> Costo de procesamiento
            </span>
            <span className="font-bold">
              {!meta
                ? "—"
                : cotizando || !cotizacion
                  ? "Calculando..."
                  : `${cotizacion.costoCreditos} tokens`}
            </span>
          </div>

          {/* Saldo + Top Up */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet02Icon className="h-4 w-4" /> Tu saldo
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {saldoMostrado != null ? `${saldoMostrado} tokens` : "—"}
              </span>
              <Link to="/creditos">
                <Button size="sm" variant="outline">
                  Recargar
                </Button>
              </Link>
            </div>
          </div>

          {meta && cotizacion && !cotizacion.saldoSuficiente && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-600">
              Saldo insuficiente para este formato.{" "}
              <Link to="/creditos" className="font-semibold underline">
                Recargar tokens
              </Link>
            </div>
          )}

          <Button
            className="w-full"
            disabled={
              !meta || !cotizacion || !cotizacion.saldoSuficiente || cotizando
            }
            onClick={handleProcesar}
          >
            {cotizacion && meta
              ? `Procesar video (${cotizacion.costoCreditos} tokens)`
              : "Procesar video"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
