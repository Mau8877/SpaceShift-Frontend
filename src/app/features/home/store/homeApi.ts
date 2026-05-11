import { api } from "@/app/store/api/api"
import type { Publicacion } from "../types"

export const homeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicaciones: builder.query<Publicacion[], void>({
      query: () => "/publicaciones",
      providesTags: ["Publicaciones"],
    }),
    getUbicaciones: builder.query<string[], void>({
      query: () => "/inmuebles/ubicaciones",
      providesTags: ["Publicaciones"],
    }),
    getTiposInmueble: builder.query<string[], void>({
      query: () => "/inmuebles/tipos",
      providesTags: ["Publicaciones"],
    }),
    getTiposTransaccion: builder.query<string[], void>({
      query: () => "/publicaciones/tipos-transaccion",
      providesTags: ["Publicaciones"],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useGetPublicacionesQuery, 
  useGetUbicacionesQuery, 
  useGetTiposInmuebleQuery,
  useGetTiposTransaccionQuery
} = homeApi
