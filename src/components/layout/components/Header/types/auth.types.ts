export interface LoginRequest {
  correo: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  apellido: string | null
  correo: string
  password: string
  tipoPerfil: string
}
