import { api } from "@/app/store/api/api"
import type { Publicacion } from "../types"

export const homeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicaciones: builder.query<Publicacion[], void>({
      query: () => "/publicaciones",
      providesTags: ["Publicaciones"],
    }),
  }),
  overrideExisting: true,
})

export const { useGetPublicacionesQuery } = homeApi
