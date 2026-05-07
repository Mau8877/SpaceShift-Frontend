export type ContractType =
  | "ALQUILER"
  | "VENTA"
  | "ANTICRETICO"
  | "RESERVA_TEMPORAL"

export type ContractStatus =
  | "ACTIVO"
  | "POR_VENCER"
  | "VENCIDO"
  | "BORRADOR"

export type DashboardContract = {
  id: string
  codigo: string
  tipoContrato: ContractType
  estado: ContractStatus
  cliente: string
  inmueble: string
  fechaInicio: string
  fechaFin: string
  moneda: string
  monto: number
  renovacionAutomatica: boolean
  ultimaActualizacion: string
}
