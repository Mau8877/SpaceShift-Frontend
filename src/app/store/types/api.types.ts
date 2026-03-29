import type { UserAuth } from "./"

// 1. El JWT es: Lo que tiene el UserAuth (id, nombre, etc) + sub (email) + iat/exp
// Usamos "Omit" para quitar el email original y "sub" para el del JWT
export interface JWTPayload extends Omit<UserAuth, "email"> {
  sub: string // El email en el JWT viene como 'sub'
  iat: number
  exp: number
}

// 2. Lo que responde el servidor
export interface TokenResponse {
  token: string
}

// 3. Configuración técnica del sistema
export type ApiConfig = {
  baseUrl: string
  timeout?: number
  apiName?: string
  debug?: boolean
}

export type ExtraOptionsApi = {
  unauthenticated?: boolean
}
