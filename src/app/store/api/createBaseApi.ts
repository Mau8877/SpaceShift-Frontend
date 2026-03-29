import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { logout, setCredentials } from "../authSlice"
import type { ApiConfig } from "../types"
import i18n from "@/i18n"

let refreshPromise: Promise<{ token: string }> | null = null

// --- FUNCIÓN PARA REFRESCAR EL TOKEN ---
async function refreshAuthToken(baseUrl: string): Promise<{ token: string }> {
  const tokenActual = Cookies.get("token")

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenActual}`,
    },
  })

  if (!response.ok) throw new Error("Refresh failed")
  const data = await response.json()
  return data
}

export function createBaseApi(config: ApiConfig) {
  const {
    baseUrl,
    timeout = 30000,
    apiName = "SpaceShift-API",
    debug = true,
  } = config

  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    timeout,
    prepareHeaders: (headers) => {
      const token = Cookies.get("token")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  })

  //  --- WRAPPER DE LOGS  ---
  const baseQueryWithLogging: typeof rawBaseQuery = async (
    args,
    api,
    extraOptions
  ) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (debug) {
      const url = typeof args === "string" ? args : args.url
      const method = typeof args === "string" ? "GET" : (args.method ?? "GET")
      const rawStatus = result.meta?.response?.status ?? result.error?.status

      const isSuccess =
        typeof rawStatus === "number" && rawStatus >= 200 && rawStatus < 300
      const color = isSuccess
        ? "background: #22c55e; color: #fff; border-radius: 4px; padding: 2px; font-weight: bold;"
        : "background: #ef4444; color: #fff; border-radius: 4px; padding: 2px; font-weight: bold;"

      console.groupCollapsed(
        `%c [${apiName}] ${method} ${rawStatus || "ERR"} `,
        color,
        url
      )

      if (result.error) {
        let cleanError: unknown = result.error

        if (typeof result.error === "object") {
          if ("data" in result.error) {
            cleanError = result.error.data
          } else if ("error" in result.error) {
            cleanError = result.error.error
          }
        }

        console.info("❌ Response Error:", cleanError)
      }

      if (result.data) {
        console.info("✅ Response Data:", result.data)
      }

      console.groupEnd()
    }

    return result
  }

  // --- WRAPPER MAESTRO CON RE-AUTENTICACIÓN ---
  const baseQueryWithReauth: typeof rawBaseQuery = async (
    args,
    api,
    extraOptions
  ) => {
    // 1. Usamos el wrapper con logs en lugar de rawBaseQuery
    let result = await baseQueryWithLogging(args, api, extraOptions)

    const url = typeof args === "string" ? args : args.url

    const t = i18n.t.bind(i18n)

    // 2. MANEJO DE ERRORES Y RE-AUTENTICACIÓN
    if (result.error) {
      const errorStatus = result.error.status
      const errorData = result.error.data as any
      const isAuthEndpoint =
        url.includes("/auth/login") || url.includes("/auth/register")

      // --- CASO 401: TOKEN EXPIRADO O INVÁLIDO ---
      if (errorStatus === 401 && !isAuthEndpoint) {
        if (!refreshPromise) {
          console.log(
            `[REACTIVE-REFRESH] 401 detectado, solicitando nuevo token...`
          )
          refreshPromise = refreshAuthToken(baseUrl)
        }

        try {
          const { token } = await refreshPromise
          // Guardamos nuevo token y reintentamos
          api.dispatch(setCredentials({ token }))

          // Re-intentamos usando la función con logs para ver el éxito del segundo intento
          result = await baseQueryWithLogging(args, api, extraOptions)
        } catch (err) {
          console.warn("🔐 Fallo el refresh. Limpiando sesión...")
          api.dispatch(logout())
          if (window.location.pathname !== "/") {
            window.location.href = "/"
          }
        } finally {
          refreshPromise = null
        }
      }

      // --- MOSTRAR TOASTS DE ERROR ---
      // Si después del intento de refresh sigue habiendo error, mostramos el toast
      if (result.error) {
        const errorMessage =
          errorData?.message || t("toast.api.error-inesperado")

        switch (errorStatus) {
          case 400:
            toast.error(t("toast.api.datos-invalidos"), {
              description: errorMessage,
            })
            break
          case 401:
            if (!isAuthEndpoint) {
              toast.error(t("toast.api.sesion-expirada.titulo"), {
                description: t("toast.api.sesion-expirada.descripcion"),
              })
            }
            break
          case 403:
            toast.error(t("toast.api.acceso-denegado.titulo"), {
              description: t("toast.api.acceso-denegado.descripcion"),
            })
            break
          case 500:
            toast.error(t("toast.api.error-servidor.titulo"), {
              description: t("toast.api.error-servidor.descripcion"),
            })
            break
          case "FETCH_ERROR":
            toast.error(t("toast.api.error-conexion.titulo"), {
              description: t("toast.api.error-conexion.descripcion"),
            })
            break
        }
      }
    }

    return result
  }

  return baseQueryWithReauth
}
