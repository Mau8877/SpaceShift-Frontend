import { api } from "@/app/store/api/api"
import type { InmuebleRequestDTO, InmuebleResponseDTO, PublicacionRequestDTO } from "../types"

export const publicacionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Crear Inmueble primero
    crearInmueble: builder.mutation<InmuebleResponseDTO, InmuebleRequestDTO>({
      query: (data) => ({
        url: "/inmuebles",
        method: "POST",
        body: data,
      }),
    }),

    // 2. Crear Publicación acoplando el ID del Inmueble
    crearPublicacion: builder.mutation<any, PublicacionRequestDTO>({
      query: (data) => ({
        url: "/publicaciones",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Publicaciones"],
    }),
  }),
  overrideExisting: true,
})

export const { useCrearInmuebleMutation, useCrearPublicacionMutation } = publicacionApi
