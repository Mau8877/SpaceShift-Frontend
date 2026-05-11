import { api } from "@/app/store/api/api"

export type ReporteTipo = "usuarios" | "publicaciones" | "contratos" | "resumen"
export type ReporteFormato = "excel" | "pdf"

export type DescargaParams = {
  tipo: ReporteTipo
  formato: ReporteFormato
  fechaInicio?: string
  fechaFin?: string
}

const buildUrl = ({ tipo, formato, fechaInicio, fechaFin }: DescargaParams) => {
  const params = new URLSearchParams()
  if (fechaInicio) params.set("fechaInicio", fechaInicio)
  if (fechaFin) params.set("fechaFin", fechaFin)
  const qs = params.toString()
  return `/reportes/${tipo}/${formato}${qs ? `?${qs}` : ""}`
}

export const reportesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    descargarReporte: builder.mutation<Blob, DescargaParams>({
      query: (params) => ({
        url: buildUrl(params),
        method: "GET",
        responseHandler: (response) => response.blob(),
        cache: "no-cache",
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useDescargarReporteMutation } = reportesApi
