import { createFileRoute } from '@tanstack/react-router'
import { MisFavoritosScreen } from '@/app/features/publicaciones/screens'

export const Route = createFileRoute('/_auth/favoritos')({
  component: RouteComponent,
})
function RouteComponent() {
  return <MisFavoritosScreen />
}
