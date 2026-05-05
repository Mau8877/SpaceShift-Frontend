export interface PerfilResponseDTO {
  correo: string
  estadoConexion: boolean
  tipoPerfil: string
  nombre: string
  apellido: string | null
  fotoUrl: string | null
}

export interface UpdatePerfilRequestDTO {
  correo?: string
  estadoConexion?: boolean
  tipoPerfil?: string
  nombre?: string
  apellido?: string
  fotoUrl?: string
}

export interface UpdatePerfilPayload {
  idUsuario: string
  data: UpdatePerfilRequestDTO
}
