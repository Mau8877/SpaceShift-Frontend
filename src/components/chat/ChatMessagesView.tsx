import React, { useEffect, useRef, useCallback } from "react"
import { useGetChatMessagesQuery, useGetChatsQuery } from "@/app/store/api/chatApi"
import { useAppSelector, useAppDispatch } from "@/app/store"
import { setTyping, setUserOnline } from "@/app/store/chatUiSlice"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft01Icon, SentIcon } from "hugeicons-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useChatSocket } from "@/hooks/useChatSocket"
import type { ChatMessage } from "@/app/store/types"

interface ChatMessagesViewProps {
  conversacionId: string
  onBack: () => void
}

export function ChatMessagesView({ conversacionId, onBack }: ChatMessagesViewProps) {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const isOtherTyping = useAppSelector((state) => state.chatUi.typingUsers[conversacionId] ?? false)

  const { data: messagesData, isLoading } = useGetChatMessagesQuery({ conversacionId })
  const { data: chats } = useGetChatsQuery()

  const activeChat = chats?.find((c) => c.conversacionId === conversacionId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputText, setInputText] = React.useState("")
  const [realTimeMessages, setRealTimeMessages] = React.useState<ChatMessage[]>([])

  // Timer para limpiar el indicador de typing automáticamente
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Timer para limpiar el estado online por inactividad (60s)
  const onlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Limpiar mensajes en tiempo real al cambiar de conversación
  useEffect(() => {
    setRealTimeMessages([])
    dispatch(setTyping({ conversacionId, isTyping: false }))
  }, [conversacionId, dispatch])

  const onMessageReceived = useCallback((msg: any) => {
    console.log("[STOMP RCV]", msg)
    // Evento de typing del otro usuario
    if (msg.tipo === "TYPING" && msg.conversacionId === conversacionId) {
      const userId: string = msg.usuarioId

      // Marcar al usuario como online (recibimos actividad suya)
      dispatch(setUserOnline({ userId, online: true }))
      // Auto-offline si no hay actividad en 60s
      if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current)
      onlineTimerRef.current = setTimeout(() => {
        dispatch(setUserOnline({ userId, online: false }))
      }, 60_000)

      // Actualizar indicador de typing
      dispatch(setTyping({ conversacionId, isTyping: msg.escribiendo }))
      if (msg.escribiendo) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => {
          dispatch(setTyping({ conversacionId, isTyping: false }))
        }, 3000)
      }
      return
    }
    // Mensaje normal - si tiene ID, es un mensaje confirmado desde el backend
    if (msg.id && (msg.conversacionId === conversacionId || msg.conversacionId == null)) {
      setRealTimeMessages((prev) => {
        // Evitar duplicados (por si RTK Query lo trae al mismo tiempo)
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    } else if (msg.conversacionId !== conversacionId && msg.tipo !== "TYPING") {
      console.warn("[STOMP] Conversacion ID mismatch:", msg.conversacionId, "vs", conversacionId)
    }
  }, [conversacionId, dispatch])

  const { sendMessage } = useChatSocket({
    onMessageReceived,
    topics: [
      `/topic/chat.${conversacionId}`,
      `/topic/chat.typing.${conversacionId}`,
    ],
  })

  // Debounce: enviar evento typing y programar el stop automático
  const typingSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTyping = useCallback((value: string) => {
    setInputText(value)
    // Enviar "está escribiendo"
    sendMessage("/app/chat.typing", {
      conversacionId,
      escribiendo: true,
    })
    // Programar el stop de typing tras 2s sin escribir
    if (typingSendTimerRef.current) clearTimeout(typingSendTimerRef.current)
    typingSendTimerRef.current = setTimeout(() => {
      sendMessage("/app/chat.typing", {
        conversacionId,
        escribiendo: false,
      })
    }, 2000)
  }, [conversacionId, sendMessage])

  // Combinamos historial REST con mensajes en tiempo real
  // Asumimos que messagesData.content viene de más reciente a más antiguo (por eso el reverse original)
  const historyMessages = messagesData?.content.slice().reverse() || []
  const allMessages = [...historyMessages, ...realTimeMessages]

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [allMessages, isLoading])

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim()) return

    const messageText = inputText.trim()
    setInputText("")

    // Send the real message first
    sendMessage("/app/chat.send", {
      conversacionId,
      contenido: messageText,
    })

    // Cancel typing timer and notify stop slightly after
    if (typingSendTimerRef.current) clearTimeout(typingSendTimerRef.current)
    setTimeout(() => {
      sendMessage("/app/chat.typing", { conversacionId, escribiendo: false })
    }, 50)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft01Icon className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src={activeChat?.fotoOtroUsuario} />
          <AvatarFallback>{activeChat?.nombreOtroUsuario.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{activeChat?.nombreOtroUsuario}</h4>
          {isOtherTyping ? (
            <p className="text-[10px] text-primary flex items-center gap-1">
              <span className="flex gap-0.5">
                <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </span>
              escribiendo...
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground truncate">{activeChat?.tituloPropiedad}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "flex-row" : "flex-row-reverse")}>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-10 w-[60%] rounded-2xl" />
              </div>
            ))
          ) : allMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 text-xs">
              Sin mensajes previos. ¡Inicia la conversación!
            </div>
          ) : (
            allMessages.map((msg) => {
              const isMe = msg.remitenteId === user?.id
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.contenido}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.creadoEn), "HH:mm", { locale: es })}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-muted/10">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <Input
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChange={(e) => handleTyping(e.target.value)}
            className="h-9 bg-background"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim()}
            className="h-9 w-9 shrink-0"
          >
            <SentIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
