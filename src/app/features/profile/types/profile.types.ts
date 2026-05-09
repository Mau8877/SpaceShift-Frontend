export interface PerfilResponseDTO {
  correo: string
  estadoConexion: boolean
  tipoPerfil: string
  nombre: string
  apellido: string | null
  fotoUrl: string | null
  telefono: string | null
  descripcion: string | null
}

export interface UpdatePerfilRequestDTO {
  correo?: string
  estadoConexion?: boolean
  tipoPerfil?: string
  nombre?: string
  apellido?: string
  fotoUrl?: string
  telefono?: string
  descripcion?: string
}

export interface UpdatePerfilPayload {
  idUsuario: string
  data: UpdatePerfilRequestDTO
}
