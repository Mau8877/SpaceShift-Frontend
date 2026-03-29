import { redirect } from "@tanstack/react-router"

export function requireAuth(context: any, location: any) {
  if (!context.auth.isAuthenticated) {
    throw redirect({
      to: "/",
      search: {
        redirect: location.href,
      },
    })
  }
}
