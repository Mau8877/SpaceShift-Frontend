import { api } from "@/app/store/api/api"

interface MensajeResponse {
  mensaje: string
}

interface RecuperarPasswordRequest {
  correo: string
}

interface ValidarCodigoRequest {
  correo: string
  codigo: string
}

interface CambiarPasswordRequest {
  correo: string
  codigo: string
  nuevaPassword: string
}

export const passwordRecoveryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    solicitarRecuperacion: builder.mutation<MensajeResponse, RecuperarPasswordRequest>({
      query: (body) => ({
        url: "/auth/recuperar-password",
        method: "POST",
        body,
      }),
    }),
    validarCodigo: builder.mutation<MensajeResponse, ValidarCodigoRequest>({
      query: (body) => ({
        url: "/auth/validar-codigo",
        method: "POST",
        body,
      }),
    }),
    cambiarPassword: builder.mutation<MensajeResponse, CambiarPasswordRequest>({
      query: (body) => ({
        url: "/auth/cambiar-password",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useSolicitarRecuperacionMutation,
  useValidarCodigoMutation,
  useCambiarPasswordMutation,
} = passwordRecoveryApi