import { Outlet } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { DashboardTabs } from "../components"

type DashboardLayoutProps = {
  children?: ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <section className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white">
          <DashboardTabs />

          <main className="-mt-px min-h-130 rounded-tr-2xl rounded-b-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </section>
  )
}
