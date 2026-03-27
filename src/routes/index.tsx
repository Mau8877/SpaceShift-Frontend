import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { HomePageScreen } from "@/app/features/home/screens/HomePageScreen"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div>
      <HomePageScreen />
    </div>
  )
}
