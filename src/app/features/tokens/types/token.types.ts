export type TipoTransaccion = "REGISTRO_INICIAL" | "CONSUMO_PROCESAMIENTO" | "REEMBOLSO";

export interface TransaccionCreditoDTO {
  id: string;
  cantidad: number;
  tipo: TipoTransaccion;
  descripcion: string | null;
  idPublicacion: string | null;
  createdDate: string;
}

export interface TokenBalanceDTO {
  saldoCreditos: number;
  usuarioId: string;
}

export interface PaqueteCreditoDTO {
  id: string;
  nombrePaquete: string;
  precio: number;
  descripcion: string | null;
  creditosPaquetes: number;
}
