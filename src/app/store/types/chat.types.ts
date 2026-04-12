export interface ChatConversation {
  conversacionId: string
  tituloPropiedad: string
  otroUsuarioId: string
  nombreOtroUsuario: string
  fotoOtroUsuario: string
  ultimoMensajeFecha: string
}

export interface ChatMessage {
  id: string
  conversacionId: string
  remitenteId: string
  contenido: string
  estado: "ENVIADO" | "RECIBIDO" | "LEIDO"
  creadoEn: string
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
}
