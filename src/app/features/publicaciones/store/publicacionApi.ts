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

    // 5. Obtener mis publicaciones
    getMisPublicaciones: builder.query<any[], void>({
      query: () => "/publicaciones/mis-publicaciones",
      providesTags: ["Publicaciones"],
    }),

    // 6. Actualizar publicación
    actualizarPublicacion: builder.mutation<any, { id: string; data: PublicacionRequestDTO }>({
      query: ({ id, data }) => ({
        url: `/publicaciones/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Publicaciones", { type: "Publicaciones", id }],
    }),

    // 7. Eliminar publicación
    eliminarPublicacion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/publicaciones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Publicaciones"],
    }),

    // 8. Favoritos
    getMisFavoritos: builder.query<any[], void>({
      query: () => "/publicaciones/mis-favoritos",
      providesTags: ["Favoritos", "Publicaciones"],
    }),
    toggleFavorito: builder.mutation<void, string>({
      query: (id) => ({
        url: `/publicaciones/${id}/favorito`,
        method: "POST",
      }),
      invalidatesTags: ["Favoritos", "Publicaciones"],
    }),
  }),
  overrideExisting: true,
})

export const { 
  useCrearInmuebleMutation, 
  useCrearPublicacionMutation, 
  useSubirImagenesMutation,
  useGetPublicacionByIdQuery,
  useGetMisPublicacionesQuery,
  useActualizarPublicacionMutation,
  useEliminarPublicacionMutation,
  useGetMisFavoritosQuery,
  useToggleFavoritoMutation
} = publicacionApi
