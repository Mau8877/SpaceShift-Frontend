import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChatInboxView } from "./ChatInboxView"
import { ChatMessagesView } from "./ChatMessagesView"
import { Card } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { setActiveConversation } from "@/app/store/chatUiSlice"

interface ChatFloatingWindowProps {
  isOpen: boolean
  onClose: () => void
}

export type ChatViewType = "INBOX" | "MESSAGES"

export function ChatFloatingWindow({ isOpen, onClose }: ChatFloatingWindowProps) {
  const dispatch = useAppDispatch()
  const { activeConversacionId } = useAppSelector((state) => state.chatUi)
  const [view, setView] = useState<ChatViewType>("INBOX")

  // Efecto para cambiar a vista MESSAGES si se inyecta un ID externo (ej. desde Contactar)
  React.useEffect(() => {
    if (activeConversacionId) {
      setView("MESSAGES")
    } else {
      setView("INBOX")
    }
  }, [activeConversacionId])

  const handleSelectChat = (id: string) => {
    dispatch(setActiveConversation(id))
  }

  const handleBackToInbox = () => {
    dispatch(setActiveConversation(null))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[400px] h-[500px]"
        >
          <Card className="flex h-full flex-col overflow-hidden shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
            {view === "INBOX" ? (
              <ChatInboxView onSelectChat={handleSelectChat} />
            ) : (
              activeConversacionId && (
                <ChatMessagesView
                  conversacionId={activeConversacionId}
                  onBack={handleBackToInbox}
                />
              )
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
