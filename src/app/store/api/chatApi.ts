import { api } from "./api"
import type { ChatConversation, ChatMessage, PaginatedResponse } from "../types"

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener la bandeja de entrada
    getChats: builder.query<ChatConversation[], void>({
      query: () => "/chats",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ conversacionId }) => ({
                type: "Chat" as const,
                id: conversacionId,
              })),
              { type: "Chat", id: "LIST" },
            ]
          : [{ type: "Chat", id: "LIST" }],
    }),

    // Obtener el historial de mensajes de una conversación
    getChatMessages: builder.query<
      PaginatedResponse<ChatMessage>,
      { conversacionId: string; page?: number; size?: number }
    >({
      query: ({ conversacionId, page = 0, size = 20 }) => ({
        url: `/chats/${conversacionId}/messages`,
        params: { page, size },
      }),
      providesTags: (result, _error, { conversacionId }) => [
        { type: "Messages", id: conversacionId },
      ],
    }),
    // Crear una conversación nueva para una publicación
    createChat: builder.mutation<ChatConversation, { publicacionId: string }>({
      query: (data) => ({
        url: "/chats",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),
  }),
})

export const { useGetChatsQuery, useGetChatMessagesQuery, useCreateChatMutation } = chatApi
