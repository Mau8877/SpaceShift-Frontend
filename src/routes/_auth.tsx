import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { MainLayout } from "@/components/layout"

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    if (typeof window === "undefined") return

    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/",
        search: { redirect: location.href },
      })
    }
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
