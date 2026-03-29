import { createFileRoute, Outlet } from "@tanstack/react-router"
import { MainLayout } from "@/components/layout"

export const Route = createFileRoute("/_public")({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
})
