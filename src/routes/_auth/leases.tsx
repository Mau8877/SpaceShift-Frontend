import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/leases')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/leases"!</div>
}
