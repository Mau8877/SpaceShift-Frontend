import React from "react"
import { useGetChatsQuery } from "@/app/store/api/chatApi"
import { useAppSelector } from "@/app/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Search01Icon, Message01Icon } from "hugeicons-react"
import { Input } from "@/components/ui/input"

interface ChatInboxViewProps {
  onSelectChat: (id: string) => void
}

export function ChatInboxView({ onSelectChat }: ChatInboxViewProps) {
  const { data: chats, isLoading, error } = useGetChatsQuery()
  const typingUsers = useAppSelector((state) => state.chatUi.typingUsers)
  const onlineUsers = useAppSelector((state) => state.chatUi.onlineUsers)

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Message01Icon className="h-5 w-5 text-primary" />
          Mensajes
        </h3>
        <div className="mt-3 relative">
          <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            className="pl-9 h-9 bg-background/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b last:border-0">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Error al cargar los chats.</p>
            </div>
          ) : chats?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No tienes conversaciones activas.</p>
            </div>
          ) : (
            chats?.map((chat) => (
              <button
                key={chat.conversacionId}
                onClick={() => onSelectChat(chat.conversacionId)}
                className="flex items-center gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage src={chat.fotoOtroUsuario} alt={chat.nombreOtroUsuario} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {chat.nombreOtroUsuario.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-semibold truncate text-sm">
                      {chat.nombreOtroUsuario}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(chat.ultimoMensajeFecha), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  {/* Estado de presencia / typing */}
                  {typingUsers[chat.conversacionId] ? (
                    <p className="text-[10px] text-primary flex items-center gap-1">
                      <span className="flex gap-0.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </span>
                      escribiendo...
                    </p>
                  ) : onlineUsers[chat.otroUsuarioId] ? (
                    <p className="text-[10px] flex items-center gap-1 text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      En línea
                    </p>
                  ) : (
                    <p className="text-[10px] flex items-center gap-1 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block" />
                      {chat.tituloPropiedad}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
