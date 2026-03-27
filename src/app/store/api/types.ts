import type { User } from '../authSlice'

export interface DecodedToken {
  exp: number
  user_id?: string
}

export type ApiConfig = {
  baseUrl: string
  timeout?: number
  apiName?: string
  debug?: boolean
}

export type ExtraOptionsApi = {
  unauthenticated?: boolean
}

export interface TokenResponse {
  access: string
  refresh: string
  user?: User
}