import { api } from "@/app/store/api/api"
import type {
  CotizacionResponse,
  UploadUrlResponse,
  VideoPublicacionDTO,
  VideoUploadRequest,
} from "../types"

export const videoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Lista los videos (y sus modelos 3D) de una publicación. GET público en el backend.
    getVideosByPublicacion: builder.query<VideoPublicacionDTO[], string>({
      query: (idPublicacion) => `/videos/publicaciones/${idPublicacion}`,
      providesTags: (_result, _error, idPublicacion) => [
        { type: "Videos", id: idPublicacion },
      ],
    }),

    // Paso 0: cotizar el procesamiento (no debita créditos).
    cotizarVideo: builder.query<CotizacionResponse, number>({
      query: (duracionSegundos) =>
        `/videos/cotizar?duracionSegundos=${duracionSegundos}`,
    }),

    // Paso 1: obtener URL pre-firmada de S3 para subir el video.
    getUploadUrl: builder.query<UploadUrlResponse, string>({
      query: (extension) => `/videos/upload-url?extension=${extension}`,
    }),

    // Paso 2: registrar el video, debitar créditos e iniciar el procesamiento en Runpod.
    registrarVideo: builder.mutation<
      VideoPublicacionDTO,
      { idPublicacion: string; body: VideoUploadRequest }
    >({
      query: ({ idPublicacion, body }) => ({
        url: `/videos/publicaciones/${idPublicacion}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { idPublicacion }) => [
        { type: "Videos", id: idPublicacion },
      ],
    }),

    // Paso 3: consultar estado (polling).
    getEstadoVideo: builder.query<VideoPublicacionDTO, string>({
      query: (idVideo) => `/videos/${idVideo}/estado`,
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetVideosByPublicacionQuery,
  useCotizarVideoQuery,
  useLazyGetUploadUrlQuery,
  useRegistrarVideoMutation,
  useGetEstadoVideoQuery,
} = videoApi
