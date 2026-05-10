import { Notification01Icon } from "hugeicons-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { markAllAsRead, markAsRead } from "@/app/store/notificacionesSlice"
import type { NotificacionItem } from "@/app/store/notificacionesSlice"

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return "ahora"
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86400)} d`
}

function NotificacionRow({ item }: { item: NotificacionItem }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleNavigate = () => {
    dispatch(markAsRead(item.id))
    if (item.type === "NEW_MESSAGE" && item.data.conversacionId) {
      navigate({ to: "/dashboard" })
    }
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors ${
        item.read ? "opacity-60" : "bg-blue-50/50 dark:bg-blue-950/20"
      }`}
    >
      <span className="mt-0.5 text-lg">💬</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{item.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {item.body}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/70">
          {timeAgo(item.receivedAt)}
        </p>
      </div>
      {item.type === "NEW_MESSAGE" && (
        <button
          onClick={handleNavigate}
          className="mt-0.5 shrink-0 text-xs text-primary hover:underline"
          aria-label="Ir al chat"
        >
          →
        </button>
      )}
    </div>
  )
}

export function NotificationBell() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.notificaciones.items)
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 shrink-0 text-white hover:bg-white/10"
          aria-label="Notificaciones"
        >
          <Notification01Icon className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unread > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead())}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-80 divide-y overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin notificaciones
            </p>
          ) : (
            items.map((item) => <NotificacionRow key={item.id} item={item} />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
