import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { store } from "@/app/store/redux"

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: {
      auth: store.getState().auth,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  store.subscribe(() => {
    router.update({
      context: {
        auth: store.getState().auth,
      },
    })
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
