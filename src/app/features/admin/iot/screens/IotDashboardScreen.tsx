import { PendingTicketsPanel, PlugInventoryTable } from "../components"

export const IotDashboardScreen = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold text-slate-950">Panel técnico — Gestión IoT</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlugInventoryTable />
        </div>
        <div>
          <PendingTicketsPanel />
        </div>
      </div>
    </div>
  )
}
