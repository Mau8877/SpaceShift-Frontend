import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { I18nextProvider } from "react-i18next"
import appCss from "../styles.css?url"
import i18n from "../i18n"
import { MainLayout } from "@/components/layout"

export const Route = createRootRoute({
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
    <I18nextProvider i18n={i18n}>
      <RootDocument>
        <MainLayout />
      </RootDocument>
    </I18nextProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18n.language || "es"}>
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
