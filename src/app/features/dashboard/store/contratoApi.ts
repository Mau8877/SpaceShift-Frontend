import { api } from "@/app/store/api/api"
import type {
  ContratoResponseDTO,
  ContratoRequestDTO,
  PagoContratoDTO,
} from "../types/mis-contratos.types"

export const contratoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContratosComoPropietario: builder.query<ContratoResponseDTO[], void>({
      query: () => "/contratos/propietario",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Contratos" as const, id })),
              { type: "Contratos", id: "LIST_OWNER" },
            ]
          : [{ type: "Contratos", id: "LIST_OWNER" }],
    }),
    getContratosComoCliente: builder.query<ContratoResponseDTO[], void>({
      query: () => "/contratos/cliente",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Contratos" as const, id })),
              { type: "Contratos", id: "LIST_CLIENT" },
            ]
          : [{ type: "Contratos", id: "LIST_CLIENT" }],
    }),
    getContratoPorId: builder.query<ContratoResponseDTO, string>({
      query: (id) => `/contratos/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Contratos", id }],
    }),
    crearContrato: builder.mutation<ContratoResponseDTO, ContratoRequestDTO>({
      query: (body) => ({
        url: "/contratos",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Contratos", id: "LIST_OWNER" },
        { type: "Contratos", id: "LIST_CLIENT" },
      ],
    }),
    eliminarContrato: builder.mutation<void, string>({
      query: (id) => ({
        url: `/contratos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Contratos", id: "LIST_OWNER" },
        { type: "Contratos", id: "LIST_CLIENT" },
      ],
    }),
    cancelarContrato: builder.mutation<ContratoResponseDTO, string>({
      query: (id) => ({
        url: `/contratos/${id}/cancelar`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Contratos", id },
        { type: "Contratos", id: "LIST_CLIENT" },
        { type: "Contratos", id: "LIST_OWNER" },
      ],
    }),
    firmarContrato: builder.mutation<ContratoResponseDTO, string>({
      query: (id) => ({
        url: `/contratos/${id}/firmar`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Contratos", id },
        { type: "Contratos", id: "LIST_CLIENT" },
        { type: "Contratos", id: "LIST_OWNER" },
      ],
    }),
    getPagosDeContrato: builder.query<PagoContratoDTO[], string>({
      query: (contratoId) => `/contratos/${contratoId}/pagos`,
      providesTags: (result, _error, contratoId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Pagos" as const, id })),
              { type: "Pagos", id: `PAYMENTS_${contratoId}` },
            ]
          : [{ type: "Pagos", id: `PAYMENTS_${contratoId}` }],
    }),
    subirComprobantePago: builder.mutation<
      PagoContratoDTO,
      { pagoId: string; comprobante: File }
    >({
      query: ({ pagoId, comprobante }) => {
        const formData = new FormData()
        formData.append("comprobante", comprobante)
        return {
          url: `/pagos/${pagoId}/comprobante`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { pagoId }) => [
        { type: "Pagos", id: pagoId },
      ],
    }),
    aprobarPagoManual: builder.mutation<PagoContratoDTO, string>({
      query: (pagoId) => ({
        url: `/pagos/${pagoId}/aprobar`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, pagoId) => [
        { type: "Pagos", id: pagoId },
      ],
    }),
    registrarPagoEfectivo: builder.mutation<PagoContratoDTO, string>({
      query: (pagoId) => ({
        url: `/pagos/${pagoId}/registrar-efectivo`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, pagoId) => [
        { type: "Pagos", id: pagoId },
      ],
    }),
    generarSesionPagoStripe: builder.mutation<
      { stripeCheckoutUrl: string },
      string
    >({
      query: (pagoId) => ({
        url: `/pagos/${pagoId}/stripe-checkout`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetContratosComoPropietarioQuery,
  useGetContratosComoClienteQuery,
  useGetContratoPorIdQuery,
  useCrearContratoMutation,
  useFirmarContratoMutation,
  useGetPagosDeContratoQuery,
  useSubirComprobantePagoMutation,
  useAprobarPagoManualMutation,
  useRegistrarPagoEfectivoMutation,
  useGenerarSesionPagoStripeMutation,
  useEliminarContratoMutation,
  useCancelarContratoMutation,
} = contratoApi
