import * as React from "react"
import { Outlet } from "@tanstack/react-router"
import { AppSidebar, Header } from "../components"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAppSelector, useAppDispatch } from "@/app/store"
import { ChatFloatingButton, ChatFloatingWindow } from "../../chat"
import { setChatOpen } from "@/app/store/chatUiSlice"
import { setTyping, setUserOnline } from "@/app/store/chatUiSlice"
import { addNotificacion } from "@/app/store/notificacionesSlice"
import { chatApi, useGetChatsQuery } from "@/app/store/api/chatApi"
import { useChatSocket } from "@/hooks/useChatSocket"

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { isChatOpen, activeConversacionId } = useAppSelector((state) => state.chatUi)

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // ── Pre-fetch chats so cache is ALWAYS populated when authenticated ────────
  // This ensures chatApi.util.updateQueryData("getChats") has a cache to mutate.
  const { refetch: refetchChats } = useGetChatsQuery(undefined, {
    skip: !isAuthenticated,
  })

  // Ref para la conversación activa — evita stale closures en el callback
  const activeConversacionIdRef = React.useRef(activeConversacionId)
  React.useEffect(() => {
    activeConversacionIdRef.current = activeConversacionId
  }, [activeConversacionId])

  // ── Global always-on WebSocket handler ───────────────────────────────────
  const onGlobalMessageReceived = React.useCallback((msg: any) => {
    if (msg.tipo === "TYPING") {
      const userId: string = msg.usuarioId
      dispatch(setUserOnline({ userId, online: true }))
      if (msg.conversacionId) {
        dispatch(setTyping({ conversacionId: msg.conversacionId, isTyping: msg.escribiendo }))
      }
      return
    }

    if (msg.id) {
      const msgConversacionId: string = msg.conversacionId

      // Try to update the existing cache entry
      const patchResult = dispatch(
        chatApi.util.updateQueryData("getChats", undefined, (draft) => {
          const chat = draft.find((c) => c.conversacionId === msgConversacionId)
          if (chat) {
            chat.ultimoMensajeFecha = msg.creadoEn
            if (
              msg.remitenteId !== user?.id &&
              activeConversacionIdRef.current !== msgConversacionId
            ) {
              chat.mensajesSinLeer = (chat.mensajesSinLeer ?? 0) + 1
            }
            draft.sort(
              (a, b) =>
                new Date(b.ultimoMensajeFecha).getTime() -
                new Date(a.ultimoMensajeFecha).getTime()
            )
          }
        })
      )

      // If the patch didn't find the chat (cache was empty or chat not in list),
      // do a full refetch to bring in the new state from the server
      const patchedState = (patchResult as any)?.patches
      if (!patchedState || patchedState.length === 0) {
        refetchChats()
      }

      // Show notification if from someone else
      if (msg.remitenteId !== user?.id) {
        dispatch(
          addNotificacion({
            id: crypto.randomUUID(),
            title: "Nuevo mensaje",
            body: msg.contenido ?? "",
            type: "NEW_MESSAGE",
            data: { conversacionId: msgConversacionId },
            receivedAt: new Date().toISOString(),
            read: false,
          })
        )
      }
    }
  }, [dispatch, user?.id, refetchChats])

  // Always-on socket — enabled as soon as user is authenticated
  useChatSocket({ onMessageReceived: onGlobalMessageReceived, enabled: isAuthenticated })

  if (!mounted) {
    return null
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={isAuthenticated}>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {isAuthenticated && <AppSidebar />}

          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
              {children || <Outlet />}
            </main>
          </SidebarInset>

          {/* Chat Flotante */}
          {isAuthenticated && (
            <>
              <ChatFloatingWindow
                isOpen={isChatOpen}
                onClose={() => dispatch(setChatOpen(false))}
              />
              <ChatFloatingButton
                isOpen={isChatOpen}
                onClick={() => dispatch(setChatOpen(!isChatOpen))}
              />
            </>
          )}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
