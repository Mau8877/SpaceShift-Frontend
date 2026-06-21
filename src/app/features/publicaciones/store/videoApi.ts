import { api } from "@/app/store/api/api"
import type { VideoPublicacionDTO } from "../types"

export const videoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Lista los videos (y sus modelos 3D) de una publicación. GET público en el backend.
    getVideosByPublicacion: builder.query<VideoPublicacionDTO[], string>({
      query: (idPublicacion) => `/videos/publicaciones/${idPublicacion}`,
      providesTags: (_result, _error, idPublicacion) => [
        { type: "Videos", id: idPublicacion },
      ],
    }),
  }),
  overrideExisting: true,
})

export const { useGetVideosByPublicacionQuery } = videoApi
