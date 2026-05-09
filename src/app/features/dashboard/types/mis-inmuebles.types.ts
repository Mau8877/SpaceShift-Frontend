import type { Publicacion } from "../../home/types"

export type PropertyOperationalStatus = "DISPONIBLE" | "OCUPADO" | "INACTIVO"

export type PropertyFilterStatus = "TODOS" | PropertyOperationalStatus

export type PropertyFilterTransaction =
  | "TODOS"
  | "VENTA"
  | "ALQUILER"
  | "ANTICRETICO"
  | "AIRBNB"

export type DashboardProperty = Publicacion & {
  estadoOperativo: PropertyOperationalStatus
}
