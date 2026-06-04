export type ContractType = "VENTA" | "ALQUILER" | "ANTICRETICO" | "ALOJAMIENTO"

export type ContractStatus =
  | "BORRADOR"
  | "PENDIENTE_FIRMA"
  | "VIGENTE"
  | "FINALIZADO"
  | "CANCELADO"

export type TipoPago = "CUOTA_MENSUAL" | "GARANTIA" | "PAGO_TOTAL" | "RESERVA"

export type EstadoPago = "PENDIENTE" | "EN_REVISION" | "COMPLETADO" | "FALLIDO"

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "STRIPE"

export interface PagoContratoDTO {
  id: string
  contratoId: string
  monto: number
  moneda: string
  tipoPago: TipoPago
  estadoPago: EstadoPago
  metodoPago?: MetodoPago
  fechaVencimiento: string
  fechaPago?: string
  documentoComprobanteUrl?: string
  stripeSessionId?: string
}

export interface ContratoResponseDTO {
  id: string
  codigo: string
  tipoContrato: ContractType
  estadoContrato: ContractStatus
  propietarioId: string
  propietarioNombre: string
  clienteId: string
  clienteNombre: string
  inmuebleId: string
  inmuebleTitulo: string
  fechaInicio: string
  fechaFin?: string
  monto: number
  moneda: string
  renovacionAutomatica: boolean
  especificaciones: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ContratoRequestDTO {
  idInmueble: string
  idPublicacion?: string
  idCliente: string
  tipoContrato: ContractType
  fechaInicio?: string
  fechaFin?: string
  montoAcordado: number
  moneda: string
  cantidadHuespedes?: number
  observacion?: string
  especificaciones: Record<string, any>
}

// Mantener compatibilidad temporal con componentes existentes que utilicen DashboardContract
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
