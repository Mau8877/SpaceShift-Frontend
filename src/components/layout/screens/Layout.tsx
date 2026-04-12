import * as React from "react"
import { Outlet } from "@tanstack/react-router"
import { AppSidebar, Header } from "../components"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAppSelector, useAppDispatch } from "@/app/store"
import { ChatFloatingButton, ChatFloatingWindow } from "../../chat"
import { setChatOpen } from "@/app/store/chatUiSlice"

export function MainLayout({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { isChatOpen } = useAppSelector((state) => state.chatUi)

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Si no ha montado, no renderizamos el SidebarProvider para evitar el mismatch
  if (!mounted) {
    return null // O un loader simple
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Usamos el estado de auth para decidir si el sidebar empieza abierto */}
      <SidebarProvider defaultOpen={isAuthenticated}>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Solo mostramos el Sidebar si el usuario pasó el login */}
          {isAuthenticated && <AppSidebar />}

          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
              {/* Prioriza los hijos manuales, si no, usa el Outlet de la ruta */}
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
