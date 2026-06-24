import { api } from "@/app/store/api/api"
import type {
  InstallationTicket,
  PlugTestResult,
  SmartPlug,
  SmartPlugCreateRequest,
  TuyaDeviceScanResult,
  UpdateTicketStatusRequest,
} from "../types"

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
      { plugId: string; applianceId: string }
    >({
      query: ({ plugId, applianceId }) => ({
        url: `/iot/plugs/${plugId}/assign`,
        method: "POST",
        body: { applianceId },
      }),
      invalidatesTags: (_result, _error, { plugId }) => [
        { type: "SMART_PLUGS", id: SMART_PLUGS_LIST_TAG_ID },
        { type: "SMART_PLUGS", id: plugId },
      ],
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
  useUnassignPlugMutation,
  useGetPendingTicketsQuery,
  useUpdateTicketStatusMutation,
} = iotApi
