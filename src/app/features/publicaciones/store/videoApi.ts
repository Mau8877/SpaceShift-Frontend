import { api } from "@/app/store/api/api"
import type {
  CotizacionResponse,
  Formato3D,
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

    // Paso 0: cotizar el procesamiento (no debita créditos). El costo depende
    // del formato: SPLAT es ~1.5x más caro que SOG (el backend aplica el factor).
    cotizarVideo: builder.query<
      CotizacionResponse,
      { duracionSegundos: number; formato: Formato3D }
    >({
      query: ({ duracionSegundos, formato }) =>
        `/videos/cotizar?duracionSegundos=${duracionSegundos}&formato=${formato}`,
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
