import { createFileRoute } from "@tanstack/react-router"
import { HomePageScreen } from "@/app/features/home/screens/HomePageScreen"

export const Route = createFileRoute("/_public/")({
  component: App,
})

function App() {
  return (
    <div className="animate-in duration-500 fade-in">
      <HomePageScreen />
    </div>
  )
}
