import { createFileRoute, redirect } from "@tanstack/react-router"
import { HomePageScreen } from "@/app/features/home/screens/HomePageScreen"

export const Route = createFileRoute("/_public/")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      })
    }
  },
  component: App,
})

function App() {
  return (
    <div className="animate-in duration-500 fade-in">
      <HomePageScreen />
    </div>
  )
}
