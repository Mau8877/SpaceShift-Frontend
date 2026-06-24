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
  applianceId: string
  applianceName: string
  propertyName: string
  assignedAt: string
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
  status: InstallationTicketStatus
  requestedAt: string
  scheduledAt?: string | null
}

export interface UpdateTicketStatusRequest {
  status: InstallationTicketStatus
  scheduledAt?: string
}
