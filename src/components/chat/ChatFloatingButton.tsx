import React from "react"
import { Message01Icon, Cancel01Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatFloatingButtonProps {
  isOpen: boolean
  onClick: () => void
  unreadCount?: number
}

export function ChatFloatingButton({
  isOpen,
  onClick,
  unreadCount = 0,
}: ChatFloatingButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95",
          isOpen
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 rotate-90"
            : "bg-primary text-primary-foreground hover:bg-primary/90 rotate-0"
        )}
      >
        {isOpen ? (
          <Cancel01Icon className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Message01Icon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  )
}
