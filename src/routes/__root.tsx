import React from "react"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router"
import { Provider } from "react-redux"
import appCss from "../styles.css?url"
import type { AuthState } from "@/app/store"
import { Toaster } from "@/components/ui/sonner"
import { store } from "@/app/store/redux"
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging"
import { VideoUploadDock } from "@/app/features/publicaciones/components/VideoUploadDock"

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Space Shift" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
})

function FirebaseInit() {
  useFirebaseMessaging()
  return null
}

function RootComponent() {
  return (
    <Provider store={store}>
      <RootDocument lang="es">
        <FirebaseInit />
        <Outlet />
        <VideoUploadDock />
        <Toaster richColors position="bottom-right" />
      </RootDocument>
    </Provider>
  )
}

function RootDocument({
  children,
  lang,
}: {
  children: React.ReactNode
  lang: string
}) {
  return (
    <html lang={lang || "es"} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
