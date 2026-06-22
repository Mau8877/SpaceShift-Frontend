export type EstadoProcesamiento =
  | "PENDIENTE"
  | "PROCESANDO"
  | "COMPLETADO"
  | "FALLIDO"

// Respuesta de GET /api/videos/upload-url
export interface UploadUrlResponse {
  uploadUrl: string
  key: string
}

// Respuesta de GET /api/videos/cotizar
export interface CotizacionResponse {
  duracionSegundos: number
  factorPorSegundo: number
  costoCreditos: number
  saldoActual: number
  saldoSuficiente: boolean
}

// Metadata leída del archivo de video en el navegador
export interface VideoFileMeta {
  nombre: string
  tamanoBytes: number
  duracionSegundos: number
  extension: string
}

// Body de POST /api/videos/publicaciones/{idPublicacion}
export interface VideoUploadRequest {
  keyS3: string
  nombreArchivo: string
  tamanoBytes: number
  duracionSegundos: number
}

// Espeja el VideoResponseDTO del backend (modules/publicacion/dto/VideoResponseDTO)
export interface VideoPublicacionDTO {
  id: string // UUID
  idPublicacion: string // UUID
  urlVideo: string
  urlModelo3D: string | null
  urlSplat: string | null
  urlSog: string | null
  urlJsonModelo: string | null
  urlPreviewWebp: string | null
  duracionSegundos: number
  creditosConsumidos: number
  estadoProcesamiento: EstadoProcesamiento
  nombreArchivo: string
  tamanoBytes: number
  errorMensaje: string | null
  fechaCreacion: string | null
}
