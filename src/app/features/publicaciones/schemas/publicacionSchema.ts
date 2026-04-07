import { z } from "zod";

// --- ESQUEMA GENERAL DEL WIZARD (4 PASOS) ---
export const crearPublicacionWizardSchema = z.object({
  // PASO 1: Inmueble
  tipoInmueble: z.string().min(1, "Selecciona un tipo de inmueble"),
  areaTerreno: z.number().min(1, "El área debe ser mayor a 0"),
  areaConstruida: z.number().min(1, "El área construida debe ser mayor a 0"),
  habitaciones: z.number().min(0, "Mínimo 0"),
  banos: z.number().min(0, "Mínimo 0"),
  garajes: z.number().min(0, "Mínimo 0"),
  antiguedadAnios: z.number().min(0, "La antigüedad no puede ser negativa"),

  // PASO 2: Ubicación
  ciudad: z.string().min(1, "La ciudad es requerida"),
  zonaBarrios: z.string().min(1, "La zona o barrio es requerido"),
  direccionExacta: z.string().min(1, "La dirección es requerida"),
  latitud: z.string().min(1, "Latitud es requerida"),
  longitud: z.string().min(1, "Longitud es requerida"),

  // PASO 3: Publicación
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcionGeneral: z.string().min(10, "Añade una descripción más detallada"),
  precio: z.number().min(1, "El precio debe ser mayor a 0"),
  tipoTransaccion: z.string().min(1, "Selecciona el tipo de transacción"),
  moneda: z.string(),

  // PASO 4: Imágenes
  imagenesUrls: z.array(z.any()), // Dejamos .any() temporalmente para los archivos File puros del input base
});

export type CrearPublicacionWizardFormStyle = z.infer<typeof crearPublicacionWizardSchema>;
