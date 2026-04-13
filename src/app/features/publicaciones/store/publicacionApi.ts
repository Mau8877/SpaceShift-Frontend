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

    // 3. Subir Imágenes Múltiples (Soporta FormData)
    subirImagenes: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: "/upload/imagenes",
        method: "POST",
        body: formData,
      }),
    }),

    // 4. Obtener detalle de una publicación
    getPublicacionById: builder.query<any, string>({
      query: (id) => `/publicaciones/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Publicaciones", id }],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useCrearInmuebleMutation, 
  useCrearPublicacionMutation, 
  useSubirImagenesMutation,
  useGetPublicacionByIdQuery
} = publicacionApi
