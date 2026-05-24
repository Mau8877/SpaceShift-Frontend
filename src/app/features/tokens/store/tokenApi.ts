import { api } from "@/app/store/api/api"
import type { TokenBalanceDTO, TransaccionCreditoDTO, PaqueteCreditoDTO } from "../types/token.types"

export const tokenApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMiSaldo: builder.query<TokenBalanceDTO, void>({
      query: () => "/tokens/saldo",
      providesTags: [{ type: "Profile", id: "SALDO" }],
    }),
    getMiHistorial: builder.query<TransaccionCreditoDTO[], void>({
      query: () => "/tokens/historial",
      transformResponse: (response: any) => {
        // En Spring Boot, si viene paginado, la lista real de transacciones está en 'content'
        return response?.content || response || []
      },
      providesTags: [{ type: "Profile", id: "HISTORIAL" }],
    }),
    getPaquetes: builder.query<PaqueteCreditoDTO[], void>({
      query: () => "/tokens/paquetes",
      providesTags: [{ type: "Profile", id: "PAQUETES" }],
    }),
    crearSesionPago: builder.mutation<{ sessionUrl: string }, { paqueteId: string }>({
      query: ({ paqueteId }) => ({
        url: `/checkout/crear-sesion?paqueteId=${paqueteId}`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetMiSaldoQuery,
  useGetMiHistorialQuery,
  useGetPaquetesQuery,
  useCrearSesionPagoMutation,
} = tokenApi
