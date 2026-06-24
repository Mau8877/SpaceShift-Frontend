export type PlugStatus = "AVAILABLE" | "ASSIGNED" | "MAINTENANCE"

export type InstallationTicketStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "CLOSED"
  | "CANCELLED"

export interface TuyaDeviceScanResult {
  tuyaDeviceId: string
  name: string
  online: boolean
  alreadyRegistered: boolean
}

export interface SmartPlugAssignment {
  dispositivoId: string
  dispositivoNombre: string
  propertyName: string
  assignedAt: string
}

export interface InmuebleDispositivo {
  id: string
  nombre: string
}

export interface InmuebleOption {
  id: string
  nombre: string
  dispositivos: InmuebleDispositivo[]
}

export interface SmartPlug {
  id: string
  tuyaDeviceId: string
  alias: string
  status: PlugStatus
  notes?: string | null
  currentAssignment?: SmartPlugAssignment | null
}

export interface SmartPlugCreateRequest {
  tuyaDeviceId: string
  alias: string
  notes?: string
}

export interface PlugTestResult {
  online: boolean
  testPassed: boolean
  message: string
}

export interface InstallationTicket {
  id: string
  propertyId: string
  propertyName: string
  dispositivoId: string
  dispositivoNombre: string
  publicacionId: string | null
  status: InstallationTicketStatus
  requestedAt: string
  scheduledAt?: string | null
}

export interface UpdateTicketStatusRequest {
  status: InstallationTicketStatus
  scheduledAt?: string
}

export type TipoIncumplimiento =
  | "HORARIO_LIMITE_EXCEDIDO"
  | "HORAS_CONTINUAS_EXCEDIDAS"
  | "DESCONEXION_SOSPECHOSA"

export interface PlugPowerReading {
  recordedAt: string
  curPower: number | null
  online: boolean
}

export interface DeviceViolation {
  id: string
  tipo: TipoIncumplimiento
  detectedAt: string
  detalle: string | null
}
