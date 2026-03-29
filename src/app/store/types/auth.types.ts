export interface UserAuth {
  id: string
  nombre: string
  apellido?: string
  email: string
  rol: string
}

export interface AuthState {
  user: UserAuth | null
  token: string | null
  isAuthenticated: boolean
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}
