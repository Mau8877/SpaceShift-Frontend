import { Outlet } from "@tanstack/react-router"
import { AppSidebar, Header } from "../components"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function MainLayout() {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={false}>
        {/* Usamos h-screen para que no crezca más de la cuenta */}
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar />

          {/* SidebarInset debe tener overflow-hidden para que el contenido no empuje */}
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header />

            {/* El main es el único que puede tener scroll, pero solo VERTICAL */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
