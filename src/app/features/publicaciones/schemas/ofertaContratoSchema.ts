import { z } from "zod";

// Esquema para contratos de tipo Alquiler, Alojamiento o Anticrético
export const ofertaAlquilerSchema = z.object({
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().min(1, "La fecha de finalización es requerida"),
  observacion: z.string().optional(),
}).refine((data) => {
  if (data.fechaInicio && data.fechaFin) {
    return new Date(data.fechaFin) > new Date(data.fechaInicio);
  }
  return true;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["fechaFin"],
});

// Esquema para contratos de tipo Venta
export const ofertaVentaSchema = z.object({
  observacion: z.string().optional(),
});
