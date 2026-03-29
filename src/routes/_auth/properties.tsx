import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/properties')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/properties"!</div>
}
