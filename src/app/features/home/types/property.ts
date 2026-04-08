export interface Ubicacion {
  id?: string;
  ciudad: string;
  zonaBarrios: string;
  direccionExacta: string;
  latitud?: string;
  longitud?: string;
}

export interface InmuebleDetails {
  id?: string;
  tipoInmueble: string;
  areaTerreno: number;
  areaConstruida: number;
  habitaciones: number;
  banos: number;
  garajes: number;
  antiguedadAnios: number;
  ubicacion: Ubicacion;
}

export interface ImagenPublicacion {
  id?: string;
  url: string;
}

export interface Publicacion {
  id: string;
  titulo: string;
  descripcionGeneral: string;
  tipoTransaccion: string; // "VENTA", "ALQUILER", etc.
  precio: number;
  moneda: string;
  estadoPublicacion: string; // "ACTIVO", etc.
  fechaPublicacion: string;
  inmueble: InmuebleDetails;
  imagenes: ImagenPublicacion[];
}
