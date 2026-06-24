import { api } from "@/app/store/api/api"
import type {
  DeviceViolation,
  InmuebleOption,
  InstallationTicket,
  PlugPowerReading,
  PlugTestResult,
  SmartPlug,
  SmartPlugCreateRequest,
  TuyaDeviceScanResult,
  UpdateTicketStatusRequest,
} from "../types"

// Forma cruda que devuelve GET /api/inmuebles (InmuebleDTO de SpaceShift-Backend)
interface InmuebleRawResponse {
  id: string
  tipoInmueble: string
  ubicacion?: { zonaBarrios?: string | null } | null
  dispositivos?: Array<Record<string, unknown>> | null
}

const SMART_PLUGS_LIST_TAG_ID = "LIST"
const INSTALLATION_TICKETS_PENDING_TAG_ID = "PENDING"

export const iotApi = api.injectEndpoints({
  endpoints: (builder) => ({
    scanTuyaDevices: builder.query<TuyaDeviceScanResult[], void>({
      query: () => "/iot/plugs/scan",
    }),
    getPlugs: builder.query<SmartPlug[], void>({
      query: () => "/iot/plugs",
      providesTags: (result) => [
        { type: "SMART_PLUGS", id: SMART_PLUGS_LIST_TAG_ID },
        ...(result?.map((plug) => ({
          type: "SMART_PLUGS" as const,
          id: plug.id,
        })) ?? []),
      ],
    }),
    registerPlug: builder.mutation<SmartPlug, SmartPlugCreateRequest>({
      query: (body) => ({
        url: "/iot/plugs/verify-register",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SMART_PLUGS", id: SMART_PLUGS_LIST_TAG_ID }],
    }),
    testPlug: builder.mutation<PlugTestResult, string>({
      query: (plugId) => ({
        url: `/iot/plugs/${plugId}/test`,
        method: "POST",
      }),
    }),
    sendPlugCommand: builder.mutation<
      void,
      { plugId: string; action: "ON" | "OFF" }
    >({
      query: ({ plugId, action }) => ({
        url: `/iot/plugs/${plugId}/command`,
        method: "POST",
        body: { action },
      }),
    }),
    assignPlug: builder.mutation<
      SmartPlug,
      { plugId: string; inmuebleId: string; dispositivoId: string }
    >({
      query: ({ plugId, inmuebleId, dispositivoId }) => ({
        url: `/iot/plugs/${plugId}/assign`,
        method: "POST",
        body: { inmuebleId, dispositivoId },
      }),
      invalidatesTags: (_result, _error, { plugId }) => [
        { type: "SMART_PLUGS", id: SMART_PLUGS_LIST_TAG_ID },
        { type: "SMART_PLUGS", id: plugId },
      ],
    }),
    getInmueblesConDispositivos: builder.query<InmuebleOption[], void>({
      query: () => "/inmuebles",
      transformResponse: (response: InmuebleRawResponse[]) =>
        response
          .filter((inmueble) => (inmueble.dispositivos?.length ?? 0) > 0)
          .map((inmueble) => ({
            id: inmueble.id,
            nombre: inmueble.ubicacion?.zonaBarrios
              ? `${inmueble.tipoInmueble} · ${inmueble.ubicacion.zonaBarrios}`
              : inmueble.tipoInmueble,
            dispositivos: (inmueble.dispositivos ?? []).map((d) => ({
              id: String(d.id),
              nombre: String(d.nombre ?? "Dispositivo sin nombre"),
            })),
          })),
    }),
    unassignPlug: builder.mutation<SmartPlug, string>({
      query: (plugId) => ({
        url: `/iot/plugs/${plugId}/unassign`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, plugId) => [
        { type: "SMART_PLUGS", id: SMART_PLUGS_LIST_TAG_ID },
        { type: "SMART_PLUGS", id: plugId },
      ],
    }),
    getPendingTickets: builder.query<InstallationTicket[], void>({
      query: () => "/iot/tickets/pending",
      providesTags: [
        { type: "INSTALLATION_TICKETS", id: INSTALLATION_TICKETS_PENDING_TAG_ID },
      ],
    }),
    updateTicketStatus: builder.mutation<
      InstallationTicket,
      { ticketId: string; data: UpdateTicketStatusRequest }
    >({
      query: ({ ticketId, data }) => ({
        url: `/iot/tickets/${ticketId}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: "INSTALLATION_TICKETS", id: INSTALLATION_TICKETS_PENDING_TAG_ID },
      ],
    }),
    syncInstallationTickets: builder.mutation<void, string>({
      query: (inmuebleId) => ({
        url: `/iot/tickets/sync-inmueble/${inmuebleId}`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "INSTALLATION_TICKETS", id: INSTALLATION_TICKETS_PENDING_TAG_ID },
      ],
    }),
    getPlugPowerReadings: builder.query<
      PlugPowerReading[],
      { plugId: string; hours?: number }
    >({
      query: ({ plugId, hours = 24 }) => `/iot/plugs/${plugId}/power-readings?hours=${hours}`,
    }),
    getPlugViolations: builder.query<DeviceViolation[], string>({
      query: (plugId) => `/iot/plugs/${plugId}/violations`,
    }),
  }),
  overrideExisting: false,
})

export const {
  useScanTuyaDevicesQuery,
  useGetPlugsQuery,
  useRegisterPlugMutation,
  useTestPlugMutation,
  useSendPlugCommandMutation,
  useAssignPlugMutation,
  useGetInmueblesConDispositivosQuery,
  useUnassignPlugMutation,
  useGetPendingTicketsQuery,
  useUpdateTicketStatusMutation,
  useSyncInstallationTicketsMutation,
  useGetPlugPowerReadingsQuery,
  useGetPlugViolationsQuery,
} = iotApi
