import type { CrearPublicacionWizardFormStyle } from "../schemas/publicacionSchema";

export type CrearPublicacionForm = CrearPublicacionWizardFormStyle;

export interface DispositivoInmueble {
  id: string;
  nombre: string;
  configuracionTiempo: string;
  horarioInicio?: string;
  horarioFin?: string;
  descripcion: string;
  precioPorDia?: number;
  maxHorasSeguidas?: number;
  horarioLimiteUso?: string; // e.g. "22:00" — no se puede usar después de esta hora
  sancionIncumplimiento?: string;
}

export interface InmuebleRequestDTO {
  tipoInmueble: string;
  areaTerreno: number;
  areaConstruida: number;
  habitaciones: number;
  banos: number;
  garajes: number;
  antiguedadAnios: number;
  ubicacion: {
    ciudad: string;
    zonaBarrios: string;
    direccionExacta: string;
    latitud: string;
    longitud: string;
  };
  dispositivos?: DispositivoInmueble[];
  condiciones?: string;
  multasSanciones?: string;
}

// Lo que responde el Back al crear un Inmueble
export interface InmuebleResponseDTO {
  id: string; // UUID
  tipoInmueble: string;
  areaTerreno: number;
  areaConstruida: number;
  habitaciones: number;
  banos: number;
  garajes: number;
  antiguedadAnios: number;
  ubicacion: {
    id: string;
    ciudad: string;
    zonaBarrios: string;
    direccionExacta: string;
    latitud: string;
    longitud: string;
  };
  dispositivos?: DispositivoInmueble[];
  condiciones?: string;
  multasSanciones?: string;
}

// El DTO exacto que el backend espera para publicar
export interface PublicacionRequestDTO {
  idUsuario: string;
  idInmueble: string;
  titulo: string;
  descripcionGeneral: string;
  tipoTransaccion: string;
  precio: number;
  moneda: string;
  estadoPublicacion: string;
  imagenesUrls: string[];
  inmueble?: InmuebleRequestDTO;
}

export interface SelectedDevice {
  id: string;
  nombre: string;
  descripcion: string;
  precioPorDia: number;
  maxHorasSeguidas?: number;
  horarioLimiteUso?: string;
  configuracionTiempo?: string;
  horarioInicio?: string;
  horarioFin?: string;
  selected: boolean;
  sancionIncumplimiento?: string;
}

export interface DispositivoContratoPayload {
  id: string;
  nombre: string;
  descripcion: string;
  precioPorDia: number;
  precioContrato: number;
  cantidad: number;
  maxHorasSeguidas?: number;
  horarioLimiteUso?: string;
  configuracionTiempo?: string;
  horarioInicio?: string;
  horarioFin?: string;
  fechaInicioUso?: string;
  fechaFinUso?: string;
  sancionIncumplimiento?: string;
}

export interface CrearContratoPayload {
  idInmueble: string;
  idPublicacion: string;
  idCliente: string;
  tipoContrato: "VENTA" | "ALQUILER" | "ANTICRETICO" | "ALOJAMIENTO";
  fechaInicio?: string;
  fechaFin?: string;
  montoAcordado: number;
  moneda: string;
  observacion?: string;
  especificaciones: {
    precioBasePublicacion: number;
    precioDispositivosTotal: number;
    dispositivosContrato: DispositivoContratoPayload[];
    condicionesInmueble?: string;
    multasSancionesInmueble?: string;
    reglasContrato?: string;
    sancionesContrato?: string;
  };
}
