import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseApi } from './createBaseApi'
import type { ApiConfig } from './types'

const apiConfig: ApiConfig = {
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  apiName: 'SpaceShiftAPI',
  debug: import.meta.env.DEV,
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: createBaseApi(apiConfig),
  tagTypes: [
    
  ], 
  endpoints: () => ({}),
})