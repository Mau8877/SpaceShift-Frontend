import { createFileRoute, Outlet } from "@tanstack/react-router"
import { MainLayout } from "@/components/layout"
import { requireAuth } from "@/utils"

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    requireAuth(context, location)
  },
  component: AuthLayoutComponent,
})

function AuthLayoutComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
