export type ClientType = "INQUILINO" | "COMPRADOR" | "HUESPED" | "ANTICRESISTA"

export type ClientStatus = "ACTIVO" | "HISTORICO" | "PENDIENTE"

export type DashboardClient = {
  id: string
  nombre: string
  correo: string
  telefono: string
  tipoCliente: ClientType
  estado: ClientStatus
  inmueble: string
  contrato: string
  tipoContrato: string
  fechaInicio: string
  fechaFin: string
  ultimaActividad: string
  moneda: string
  montoContrato: number
  contratoPorVencer: boolean
}
