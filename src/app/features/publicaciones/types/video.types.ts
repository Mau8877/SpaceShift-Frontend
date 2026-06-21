export type EstadoProcesamiento =
  | "PENDIENTE"
  | "PROCESANDO"
  | "COMPLETADO"
  | "FALLIDO"

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
