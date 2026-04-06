import type { CrearPublicacionWizardFormStyle } from "../schemas/publicacionSchema";

export type CrearPublicacionForm = CrearPublicacionWizardFormStyle;

// El DTO exacto que el backend espera para crear un Inmueble
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
}

// Lo que responde el Back al crear un Inmueble
export interface InmuebleResponseDTO {
  id: string; // UUID
  // ... (pueden venir mas cosas)
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
}
