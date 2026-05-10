import { api } from "@/app/store/api/api"
import type {
  UsuarioDetalle,
  UsuarioFilters,
  UsuarioListItem,
  UsuarioPageResponse,
  UsuarioPatchRequest,
  UsuarioRequest,
} from "../types"

const USUARIOS_LIST_TAG_ID = "LIST"

const buildUsuariosQuery = (filters: UsuarioFilters = {}) => {
  const params = new URLSearchParams()

  params.set("page", String(filters.page ?? 0))
  params.set("size", String(filters.size ?? 10))
  params.set("search", filters.search ?? "")

  if (filters.estado !== null && filters.estado !== undefined) {
    params.set("estado", String(filters.estado))
  }

  if (filters.estadoConexion !== null && filters.estadoConexion !== undefined) {
    params.set("estadoConexion", String(filters.estadoConexion))
  }

  return `/usuarios?${params.toString()}`
}

export const gestionarUsuariosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsuarios: builder.query<UsuarioPageResponse, UsuarioFilters | void>({
      query: (filters) => buildUsuariosQuery(filters ?? {}),
      providesTags: (result) => [
        { type: "USUARIOS", id: USUARIOS_LIST_TAG_ID },
        ...(result?.content.map((item) => ({
          type: "USUARIOS" as const,
          id: item.id,
        })) ?? []),
      ],
    }),
    getUsuarioById: builder.query<UsuarioDetalle, string>({
      query: (id) => `/usuarios/${id}`,
      providesTags: (_result, _error, id) => [{ type: "USUARIOS", id }],
    }),
    createUsuario: builder.mutation<UsuarioListItem, UsuarioRequest>({
      query: (body) => ({
        url: "/usuarios",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "USUARIOS", id: USUARIOS_LIST_TAG_ID }],
    }),
    updateUsuario: builder.mutation<
      UsuarioListItem,
      { id: string; data: UsuarioPatchRequest }
    >({
      query: ({ id, data }) => ({
        url: `/usuarios/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "USUARIOS", id: USUARIOS_LIST_TAG_ID },
        { type: "USUARIOS", id },
      ],
    }),
    desactivarUsuario: builder.mutation<void, string>({
      query: (id) => ({
        url: `/usuarios/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "USUARIOS", id: USUARIOS_LIST_TAG_ID },
        { type: "USUARIOS", id },
      ],
    }),
    activarUsuario: builder.mutation<void, string>({
      query: (id) => ({
        url: `/usuarios/${id}/activar`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "USUARIOS", id: USUARIOS_LIST_TAG_ID },
        { type: "USUARIOS", id },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsuariosQuery,
  useGetUsuarioByIdQuery,
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
  useDesactivarUsuarioMutation,
  useActivarUsuarioMutation,
} = gestionarUsuariosApi
