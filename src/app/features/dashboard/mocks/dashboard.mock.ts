import type {
  DashboardActivityItem,
  DashboardChartItem,
  DashboardExpiringContract,
  DashboardKpi,
  DashboardPerformanceMetric,
} from "../types"

export const dashboardKpis: DashboardKpi[] = [
  {
    id: "total-properties",
    label: "Total de inmuebles",
    value: "12",
    helper: "Registrados en tu cuenta",
  },
  {
    id: "linked-clients",
    label: "Clientes vinculados",
    value: "8",
    helper: "Con contratos o conversaciones",
  },
  {
    id: "unread-messages",
    label: "Mensajes sin leer",
    value: "5",
    helper: "Pendientes de respuesta",
  },
  {
    id: "monthly-income",
    label: "Ingresos estimados",
    value: "Bs. 8.450",
    helper: "Estimado para este mes",
  },
]

export const propertyStatusMock: DashboardChartItem[] = [
  {
    label: "Disponibles",
    value: 6,
    color: "#22c55e",
  },
  {
    label: "Ocupados",
    value: 4,
    color: "#2563eb",
  },
  {
    label: "Inactivos",
    value: 2,
    color: "#94a3b8",
  },
]

export const contractStatusMock: DashboardChartItem[] = [
  {
    label: "Activos",
    value: 5,
    color: "#2563eb",
  },
  {
    label: "Pendientes",
    value: 2,
    color: "#f59e0b",
  },
  {
    label: "Finalizados",
    value: 7,
    color: "#22c55e",
  },
]

export const contractsByTypeMock: DashboardChartItem[] = [
  {
    label: "Alquiler",
    value: 5,
    color: "#2563eb",
  },
  {
    label: "Venta",
    value: 2,
    color: "#16a34a",
  },
  {
    label: "Anticrético",
    value: 1,
    color: "#9333ea",
  },
  {
    label: "Airbnb",
    value: 3,
    color: "#f97316",
  },
]

export const dashboardPerformanceMetrics: DashboardPerformanceMetric[] = [
  {
    id: "active-publications",
    label: "Publicaciones activas",
    value: "9",
    helper: "Inmuebles visibles actualmente",
  },
  {
    id: "total-contracted-amount",
    label: "Monto total contratado",
    value: "Bs. 128.500",
    helper: "Acumulado en contratos registrados",
  },
  {
    id: "conversion-rate",
    label: "Conversión publicación → contrato",
    value: "33%",
    helper: "3 de cada 9 publicaciones generaron contrato",
    progress: 33,
  },
]

export const recentActivityMock: DashboardActivityItem[] = [
  {
    id: "activity-1",
    title: "Nuevo contrato registrado",
    description: "Contrato de alquiler para Departamento Equipetrol.",
    time: "Hace 20 min",
  },
  {
    id: "activity-2",
    title: "Mensaje recibido",
    description: "Un cliente preguntó por Casa zona Norte.",
    time: "Hace 1 h",
  },
  {
    id: "activity-3",
    title: "Publicación actualizada",
    description: "Se actualizó el precio de Monoambiente Centro.",
    time: "Ayer",
  },
]

export const expiringContractsMock: DashboardExpiringContract[] = [
  {
    id: "contract-1",
    property: "Departamento Equipetrol",
    client: "María López",
    type: "Alquiler",
    expiresAt: "15/06/2026",
    daysLeft: 18,
  },
  {
    id: "contract-2",
    property: "Casa zona Norte",
    client: "Carlos Méndez",
    type: "Anticrético",
    expiresAt: "28/06/2026",
    daysLeft: 31,
  },
]
