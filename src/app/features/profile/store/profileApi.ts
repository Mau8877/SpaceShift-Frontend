import { api } from "@/app/store/api/api"
import type {
  PerfilResponseDTO,
  UpdatePerfilPayload,
} from "../types/profile.types"

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMiPerfil: builder.query<PerfilResponseDTO, void>({
      query: () => "/perfil/me",
      providesTags: [{ type: "Profile", id: "ME" }],
    }),
    getPerfilByUsuario: builder.query<PerfilResponseDTO, string>({
      query: (idUsuario) => `/perfil/usuario/${idUsuario}`,
      providesTags: (_result, _error, idUsuario) => [
        { type: "Profile", id: idUsuario },
      ],
    }),
    updatePerfil: builder.mutation<PerfilResponseDTO, UpdatePerfilPayload>({
      query: ({ idUsuario, data }) => ({
        url: `/perfil/usuario/${idUsuario}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { idUsuario }) => [
        { type: "Profile", id: "ME" },
        { type: "Profile", id: idUsuario },
      ],
    }),
    uploadProfileImage: builder.mutation<string, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append("files", file)

        return {
          url: "/upload/imagenes",
          method: "POST",
          body: formData,
        }
      },
      transformResponse: (response: string[]) => {
        if (!Array.isArray(response) || response.length === 0) {
          throw new Error("No se recibió ninguna URL de imagen")
        }
        return response[0]
      },
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetMiPerfilQuery,
  useGetPerfilByUsuarioQuery,
  useUpdatePerfilMutation,
  useUploadProfileImageMutation,
} = profileApi
