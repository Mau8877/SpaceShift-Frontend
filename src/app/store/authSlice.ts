import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, JWTPayload, UserAuth } from "./types"

/**
 * 🛠️ LECTURA PROACTIVA
 * En el servidor (SSR), esto devolverá null, lo cual está bien.
 * El cliente lo hidratará inmediatamente al cargar.
 */
const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return Cookies.get("token") || null
  }
  return null
}

const tokenFromCookie = getInitialToken()
let initialUser: UserAuth | null = null
let isAuth = false

if (tokenFromCookie) {
  try {
    const decoded = jwtDecode<JWTPayload>(tokenFromCookie)
    initialUser = {
      id: decoded.id,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      email: decoded.sub,
      rol: decoded.rol,
    }
    isAuth = true
  } catch (error) {
    if (typeof window !== "undefined") {
      Cookies.remove("token", { path: "/" })
    }
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: isAuth ? tokenFromCookie : null,
  isAuthenticated: isAuth,
  status: "idle",
  error: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      const { token } = action.payload
      try {
        const decoded = jwtDecode<JWTPayload>(token)
        const user: UserAuth = {
          id: decoded.id,
          nombre: decoded.nombre,
          apellido: decoded.apellido,
          email: decoded.sub,
          rol: decoded.rol,
        }

        state.user = user
        state.token = token
        state.isAuthenticated = true

        if (typeof window !== "undefined") {
          Cookies.set("token", token, {
            expires: 1,
            secure: true,
            sameSite: "strict",
            path: "/",
          })
        }
      } catch (error) {
        console.error("Error al setear credenciales:", error)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.status = "idle"

      if (typeof window !== "undefined") {
        Cookies.remove("token", {
          secure: true,
          sameSite: "strict",
          path: "/",
        })
      }
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
