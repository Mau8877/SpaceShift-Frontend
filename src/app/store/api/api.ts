import { createApi } from "@reduxjs/toolkit/query/react"
import { createBaseApi } from "./createBaseApi"
import type { ApiConfig } from "../types"

const apiConfig: ApiConfig = {
  // Usamos las variables de entorno de Vite (.env)
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  apiName: "SpaceShiftAPI",
  debug: import.meta.env.DEV, // Solo muestra logs en desarrollo
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: createBaseApi(apiConfig),
  tagTypes: ["Auth", "Publicaciones"],

  endpoints: () => ({}),
})
