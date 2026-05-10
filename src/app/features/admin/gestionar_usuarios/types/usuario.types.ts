export type UsuarioListItem = {
  id: string
  correo: string
  nombre: string
  apellido?: string | null
  telefono?: string | null
  estado: boolean
  estadoConexion: boolean
  rol: "ROLE_ADMIN" | "ROLE_USER" | string
  tipoPerfil: "PERSONAL" | "EMPRESA" | string
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
  apellido?: string | null
  telefono?: string | null
  descripcion?: string | null
}

export type UsuarioPatchRequest = {
  correo?: string
  nombre?: string
  apellido?: string | null
  telefono?: string | null
  descripcion?: string | null
  tipoPerfil?: string
}

export type UsuarioFilters = {
  page?: number
  size?: number
  search?: string
  estado?: boolean | null
  estadoConexion?: boolean | null
}

export type UsuarioDetalle = {
  id: string
  correo: string
  estado: boolean
  estadoConexion: boolean
  ultimaConexion?: string | null
  rol: string
  nombre: string
  apellido?: string | null
  fotoUrl?: string | null
  telefono?: string | null
  descripcion?: string | null
  tipoPerfil: string
  totalPublicaciones: number
  createdDate?: string | null
  lastModifiedDate?: string | null
}
