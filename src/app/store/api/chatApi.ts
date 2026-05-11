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
      serializeQueryArgs: ({ queryArgs }) => {
        return queryArgs.conversacionId
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 0) {
          return newItems
        }
        currentCache.content.push(...newItems.content)
        currentCache.last = newItems.last
        currentCache.pageNo = newItems.pageNo
        currentCache.totalPages = newItems.totalPages
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      },
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
    // Marcar mensajes como leídos
    markAsRead: builder.mutation<void, string>({
      query: (conversacionId) => ({
        url: `/chats/${conversacionId}/read`,
        method: "PUT",
      }),
      // Update unread count in the cache optimistically
      onQueryStarted: async (conversacionId, { dispatch, queryFulfilled }) => {
        const patch = dispatch(
          chatApi.util.updateQueryData("getChats", undefined, (draft) => {
            const chat = draft.find((c) => c.conversacionId === conversacionId)
            if (chat) {
              chat.mensajesSinLeer = 0
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
  }),
})

export const { useGetChatsQuery, useGetChatMessagesQuery, useCreateChatMutation, useMarkAsReadMutation } = chatApi
