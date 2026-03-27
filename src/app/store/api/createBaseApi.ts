import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { jwtDecode } from "jwt-decode"
import moment from 'moment'
import { logout, setCredentials } from '../authSlice'

import type { BaseQueryApi } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'
import type { User } from '../authSlice'
import type { ApiConfig, DecodedToken, ExtraOptionsApi, TokenResponse } from './types'

const minutesToRefresh = 5
let refreshPromise: Promise<TokenResponse> | null = null

// --- FUNCIONES AUXILIARES ---

async function refreshTokens(refreshToken: string, baseUrl: string): Promise<TokenResponse> {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  
  const response = await fetch(`${cleanBaseUrl}/auth/refresh/`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) throw new Error('Refresh failed')

  const json = await response.json()
  return json.data || json 
}

const handleForceLogout = (api: BaseQueryApi) => {
    console.warn("🔐 Sesión terminada. Limpiando datos...")
    api.dispatch(logout())
    localStorage.clear()
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'
    }
}

const isAuthEndpoint = (url: string): boolean => {
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')
}

const checkTokenExpiration = (token: string | null, refreshToken: string | null) => {
  if (!token || !refreshToken) return { action: 'none' as const }
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const now = moment().unix()
    const minutesUntilExpiry = (decoded.exp - now) / 60

    if (minutesUntilExpiry <= 0) return { action: 'refresh' as const, reason: 'Token expirado' }
    if (minutesUntilExpiry <= minutesToRefresh) {
      return { action: 'refresh' as const, reason: `Expira en ${Math.ceil(minutesUntilExpiry)} min` }
    }
  } catch { 
    return { action: 'logout' as const, reason: 'Token inválido' }
  }
  return { action: 'none' as const }
}

// --- LA FUNCIÓN MAESTRA ---

export function createBaseApi(config: ApiConfig) {
  const { baseUrl, timeout = 60000, apiName = 'API', debug = true } = config

  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    timeout,
    prepareHeaders: (headers, { getState, extra }) => {
        const apiExtra = extra as ExtraOptionsApi | undefined

        if (apiExtra?.unauthenticated !== true) {
            const state = getState() as RootState
            const { token, sessionId } = state.auth

            if (token) headers.set('Authorization', `Bearer ${token}`)
            if (sessionId) headers.set('X-Session-Id', sessionId)
        }
        
        return headers
    },
  })

  const baseQueryWithLogging: typeof rawBaseQuery = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (debug) {
      const url = typeof args === 'string' ? args : args.url
      const method = typeof args === 'string' ? 'GET' : args.method ?? 'GET'
      const rawStatus = result.meta?.response?.status ?? 0
      
      const isSuccess = rawStatus >= 200 && rawStatus < 300
      
      const color = isSuccess 
        ? 'background: var(--primary); color: var(--primary-foreground);' 
        : 'background: var(--destructive); color: white;'
      
      console.groupCollapsed(`%c [${apiName}] ${method} ${rawStatus} `, color + 'border-radius: 4px; padding: 2px 4px; font-weight: bold;', url)
      if (result.error) console.log('%c Error: ', 'color: var(--destructive); font-weight: bold;', result.error)
      if (result.data) console.log('%c Data: ', 'color: var(--primary); font-weight: bold;', result.data)
      console.groupEnd()
    }
    return result
  }

  const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {
    const state = api.getState() as RootState
    const { token, refreshToken, sessionId } = state.auth
    const url = typeof args === 'string' ? args : args.url

    if (!isAuthEndpoint(url) && token && refreshToken) {
      const tokenStatus = checkTokenExpiration(token, refreshToken)

      if (tokenStatus.action === 'refresh') {
        if (!refreshPromise) {
            refreshPromise = refreshTokens(refreshToken, baseUrl)
        }

        try {
            const newData = await refreshPromise
            api.dispatch(setCredentials({
                user: newData.user || (state.auth.user as User),
                access: newData.access,
                refresh: newData.refresh || refreshToken,
                session_id: sessionId ?? ""
            }))
        } catch { 
            handleForceLogout(api)
            return { error: { status: 401, data: 'Session expired' } }
        } finally {
            refreshPromise = null
        }
      }
    }

    let result = await baseQueryWithLogging(args, api, extraOptions)

    if (result.error?.status === 401 && !isAuthEndpoint(url)) {
        const currentState = api.getState() as RootState
        const currentRefresh = currentState.auth.refreshToken

        if (currentRefresh) {
            if (!refreshPromise) refreshPromise = refreshTokens(currentRefresh, baseUrl)

            try {
                const newData = await refreshPromise
                api.dispatch(setCredentials({
                    user: newData.user || (currentState.auth.user as User),
                    access: newData.access,
                    refresh: newData.refresh || currentRefresh,
                    session_id: currentState.auth.sessionId ?? ""
                }))
                result = await baseQueryWithLogging(args, api, extraOptions)
            } catch {
                handleForceLogout(api)
            } finally {
                refreshPromise = null
            }
        } else {
            handleForceLogout(api)
        }
    }

    return result
  }

  return baseQueryWithReauth
}