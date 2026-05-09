export type UsuarioListItem = {
  id: string
  correo: string
  nombre: string
  apellido?: string | null
  telefono?: string | null
  estado: boolean
  estadoConexion: boolean
  rol: string
  tipoPerfil: string
  totalPublicaciones: number
}

export type UsuarioStats = {
  totalUsuarios: number
  usuariosActivos: number
  usuariosInactivos: number
  totalPublicaciones: number
}

export type UsuarioPageResponse = {
  content: UsuarioListItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  stats: UsuarioStats
}

export type UsuarioRequest = {
  correo: string
  password: string
  rol: string
  tipoPerfil: string
  nombre: string
  apellido?: string
  telefono?: string
  descripcion?: string
}

export type UsuarioPatchRequest = {
  correo?: string
  nombre?: string
  apellido?: string
  telefono?: string
  descripcion?: string
  tipoPerfil?: string
}

export type UsuarioFilters = {
  page?: number
  size?: number
  search?: string
  estado?: boolean | null
  estadoConexion?: boolean | null
}
