import React from "react"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router"
import { I18nextProvider } from "react-i18next"
import { Provider } from "react-redux"
import appCss from "../styles.css?url"
import i18n from "../i18n"
import type { AuthState } from "@/app/store"
import { Toaster } from "@/components/ui/sonner"
import { store } from "@/app/store/redux"

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

function RootComponent() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <RootDocument lang={i18n.language}>
          <Outlet />
          <Toaster richColors position="bottom-right" />
        </RootDocument>
      </I18nextProvider>
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
