import type { AppDispatch } from "@/app/store/redux"
import {
  uploadStarted,
  uploadProgress,
  uploadPhaseChanged,
  uploadFailed,
} from "@/app/store/videoUploadSlice"
import { videoApi } from "./videoApi"
import type { VideoFileMeta } from "../types"

const POLL_INTERVAL_MS = 8000

/** PUT del binario a S3 con seguimiento de progreso (fetch no expone progreso de subida). */
function putToS3WithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Error subiendo el video a S3 (HTTP ${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error("Error de red subiendo el video a S3."))
    xhr.send(file)
  })
}

function extractError(err: unknown): string {
  const e = err as { data?: unknown; message?: string }
  if (typeof e?.data === "string") return e.data
  if (e?.data && typeof e.data === "object" && "message" in e.data) {
    return String((e.data as { message: unknown }).message)
  }
  return e?.message ?? "Ocurrió un error al procesar el video."
}

/**
 * Orquesta todo el flujo de subida y procesamiento del video FUERA del ciclo de
 * vida del modal: subida a S3 (con %), registro/cobro y polling del estado.
 * El modal puede cerrarse; el progreso se ve en el VideoUploadDock.
 */
export const iniciarSubidaVideo =
  (params: { idPublicacion: string; file: File; meta: VideoFileMeta }) =>
  async (dispatch: AppDispatch) => {
    const { idPublicacion, file, meta } = params
    const localId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    dispatch(
      uploadStarted({ id: localId, idPublicacion, nombreArchivo: meta.nombre })
    )

    try {
      // 1. URL pre-firmada
      const urlReq = dispatch(
        videoApi.endpoints.getUploadUrl.initiate(meta.extension)
      )
      const { uploadUrl, key } = await urlReq.unwrap()
      urlReq.unsubscribe()

      // 2. Subida directa a S3 con progreso
      await putToS3WithProgress(uploadUrl, file, (percent) =>
        dispatch(uploadProgress({ id: localId, progress: percent }))
      )

      // 3. Registrar + cobrar + disparar Runpod
      dispatch(uploadPhaseChanged({ id: localId, phase: "registrando" }))
      const registroReq = dispatch(
        videoApi.endpoints.registrarVideo.initiate({
          idPublicacion,
          body: {
            keyS3: key,
            nombreArchivo: meta.nombre,
            tamanoBytes: meta.tamanoBytes,
            duracionSegundos: meta.duracionSegundos,
          },
        })
      )
      const video = await registroReq.unwrap()

      // 4. Polling del estado
      dispatch(
        uploadPhaseChanged({
          id: localId,
          phase: "procesando",
          idVideo: video.id,
        })
      )

      const poll = async () => {
        try {
          const estadoReq = dispatch(
            videoApi.endpoints.getEstadoVideo.initiate(video.id, {
              forceRefetch: true,
            })
          )
          const estado = await estadoReq.unwrap()
          estadoReq.unsubscribe()

          if (estado.estadoProcesamiento === "COMPLETADO") {
            dispatch(
              uploadPhaseChanged({
                id: localId,
                phase: "completado",
                idVideo: video.id,
              })
            )
          } else if (estado.estadoProcesamiento === "FALLIDO") {
            dispatch(
              uploadFailed({
                id: localId,
                error:
                  estado.errorMensaje ??
                  "La generación del modelo 3D falló. Tus créditos fueron reembolsados.",
              })
            )
          } else {
            setTimeout(poll, POLL_INTERVAL_MS)
          }
        } catch {
          // Error transitorio consultando estado: reintentar
          setTimeout(poll, POLL_INTERVAL_MS)
        }
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    } catch (err) {
      dispatch(uploadFailed({ id: localId, error: extractError(err) }))
    }
  }
