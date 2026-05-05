import { createFileRoute } from "@tanstack/react-router"
import { ProfileScreen } from "@/app/features/profile"

export const Route = createFileRoute('/_auth/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfileScreen />
}
