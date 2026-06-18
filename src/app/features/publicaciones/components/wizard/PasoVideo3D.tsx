import { useState, useEffect } from "react"
import { PlayIcon, Upload01Icon, Coins01Icon, Alert01Icon, CheckmarkCircle02Icon } from "hugeicons-react"
import { useGetMiSaldoQuery } from "@/app/features/tokens"
import { obtenerDuracionVideo } from "@/app/utils/s3UploadHelper"

export function PasoVideo3D({ form }: { form: any }) {
  const { data: saldoData } = useGetMiSaldoQuery()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Recuperar valores iniciales si ya existen (ej. edición o navegación atrás)
  useEffect(() => {
    const currentFile = form.getFieldValue("videoFile")
    const currentDuration = form.getFieldValue("videoDuration")
    if (currentFile) {
      setSelectedFile(currentFile)
    }
    if (currentDuration) {
      setDuration(currentDuration)
    }
  }, [form])

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (val: any) => void) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedFile(file)
    setErrorMsg(null)
    setCalculating(true)

    try {
      const dur = await obtenerDuracionVideo(file)
      const duracionSegundos = Math.round(dur)
      setDuration(duracionSegundos)

      // Actualizar campos en el formulario
      fieldChange(file)
      form.setFieldValue("videoDuration", duracionSegundos)
    } catch (err: any) {
      setErrorMsg(err.message || "Error al obtener la duración del video.")
      setSelectedFile(null)
      setDuration(null)
      fieldChange(null)
      form.setFieldValue("videoDuration", 0)
    } finally {
      setCalculating(false)
    }
  }

  const removeVideo = (fieldChange: (val: any) => void) => {
    setSelectedFile(null)
    setDuration(null)
    setErrorMsg(null)
    fieldChange(null)
    form.setFieldValue("videoDuration", 0)
  }

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const saldo = saldoData?.saldoCreditos ?? 0
  const costoEstimado = duration ? duration * 2 : 0
  const saldoInsuficiente = duration !== null && saldo < costoEstimado

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Tour 3D / Escaneo de Video (Opcional)</h2>
        <p className="text-sm text-muted-foreground">
          Sube un recorrido en video del inmueble para generar automáticamente su modelo 3D interactivo.
        </p>
      </div>

      <form.Field
        name="videoFile"
        validators={{
          onChange: ({ value, fieldApi }) => {
            if (!value) return undefined
            const dur = fieldApi.form.getFieldValue("videoDuration") || 0
            const costo = dur * 2
            if (saldoData && saldoData.saldoCreditos < costo) {
              return "Saldo de créditos insuficiente para procesar este video."
            }
            return undefined
          },
        }}
        children={(field: any) => (
          <div className="space-y-4">
            {!selectedFile ? (
              <div className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors ${field.state.meta.errors.length || errorMsg ? 'border-red-500 bg-red-500/5' : 'border-border'}`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoSelect(e, field.handleChange)}
                  className="hidden"
                  id="video-upload"
                  disabled={calculating}
                />
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <PlayIcon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-foreground">Selecciona el video de escaneo</p>
                  <p className="text-xs text-muted-foreground">Formatos recomendados: MP4, MOV. Máximo 100MB.</p>
                  {calculating && <p className="text-xs text-primary animate-pulse font-medium mt-1">Analizando duración del video...</p>}
                </label>
              </div>
            ) : (
              <div className="rounded-2xl border border-border p-6 bg-muted/20 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <PlayIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground truncate max-w-[280px] sm:max-w-md">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(field.handleChange)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>

                {duration !== null && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Duración del Video</span>
                      <p className="font-bold text-sm text-foreground">{duration} segundos</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Costo de Procesamiento</span>
                      <p className="font-bold text-sm text-primary flex items-center gap-1">
                        <Coins01Icon className="w-4 h-4" />
                        {costoEstimado} créditos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mensajes de Validación y Créditos */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                <Alert01Icon className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {field.state.meta.errors.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                <Alert01Icon className="w-4 h-4 shrink-0" />
                <span>{field.state.meta.errors.join(", ")}</span>
              </div>
            )}

            {/* Cuadro informativo de créditos */}
            {duration !== null && !calculating && (
              <div className={`p-4 rounded-xl border flex gap-3 ${saldoInsuficiente ? 'bg-red-500/5 border-red-200/50 text-red-950' : 'bg-emerald-500/5 border-emerald-200/50 text-emerald-950'}`}>
                {saldoInsuficiente ? (
                  <>
                    <Alert01Icon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold">Créditos Insuficientes</p>
                      <p className="text-muted-foreground">
                        Tu saldo disponible es de <strong>{saldo} créditos</strong>. Necesitas un total de <strong>{costoEstimado} créditos</strong> para poder procesar este video.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckmarkCircle02Icon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs font-medium">
                      <p className="font-bold text-emerald-700">Créditos Suficientes</p>
                      <p className="text-emerald-600/95">
                        El costo es de <strong>{costoEstimado} créditos</strong>. Tienes un saldo disponible de <strong>{saldo} créditos</strong>.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex gap-3 text-indigo-950">
              <Coins01Icon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-indigo-800">
                <p className="font-semibold">Información del Costo</p>
                <p className="text-indigo-600/90 leading-relaxed">
                  Cada segundo de video tiene un costo de procesamiento de <strong>2 créditos</strong>. Una vez completado el procesamiento, podrás visualizar el modelo 3D e interactuar con él en realidad aumentada.
                </p>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}
