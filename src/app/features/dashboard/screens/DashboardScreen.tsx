import {
  DashboardBarStatusCard,
  DashboardDonutChartCard,
  DashboardExpiringContractsCard,
  DashboardKpiGrid,
  DashboardPerformanceGrid,
  DashboardRecentActivityCard,
} from "../components"
import {
  contractStatusMock,
  contractsByTypeMock,
  dashboardKpis,
  dashboardPerformanceMetrics,
  expiringContractsMock,
  propertyStatusMock,
  recentActivityMock,
} from "../mocks"

export const DashboardScreen = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Resumen general
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Vista rápida del estado actual de tu actividad inmobiliaria.
        </p>
      </div>

      <DashboardKpiGrid kpis={dashboardKpis} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardDonutChartCard
          title="Estado de inmuebles"
          description="Distribución actual de tus propiedades registradas."
          items={propertyStatusMock}
        />

        <DashboardBarStatusCard
          title="Estado de contratos"
          description="Resumen de contratos registrados según su estado."
          items={contractStatusMock}
        />
      </div>

      <DashboardPerformanceGrid metrics={dashboardPerformanceMetrics} />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardDonutChartCard
          title="Contratos por tipo"
          description="Distribución de contratos por modalidad."
          items={contractsByTypeMock}
        />

        <DashboardRecentActivityCard activities={recentActivityMock} />
      </div>

      <DashboardExpiringContractsCard contracts={expiringContractsMock} />
    </section>
  )
}
