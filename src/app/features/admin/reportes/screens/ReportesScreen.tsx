import { useState } from "react"
import { toast } from "sonner"
import {
  AnalyticsUpIcon,
  Building04Icon,
  ContractsIcon,
  GoogleSheetIcon,
  Loading01Icon,
  Pdf01Icon,
  UserGroup03Icon,
} from "hugeicons-react"

import { useAppSelector } from "@/app/store"
import { PaginaNoEncontrada } from "@/components/PaginaNoEncontrada"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ReporteCard, ReporteChat, type FiltrosFecha } from "../components"
import {
  type DescargaParams,
  type ReporteFormato,
  type ReporteTipo,
  useDescargarReporteMutation,
} from "../store/reportesApi"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function today() {
  return new Date().toISOString().split("T")[0]
}

function buildFilename(tipo: ReporteTipo, formato: ReporteFormato) {
  const ext = formato === "excel" ? "xlsx" : "pdf"
  return `reporte-${tipo}-${today()}.${ext}`
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

type FiltrosState = Record<Exclude<ReporteTipo, "resumen">, FiltrosFecha>

export function ReportesScreen() {
  const rol = useAppSelector((state) => state.auth.user?.rol)
  const [descargar] = useDescargarReporteMutation()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<FiltrosState>({
    usuarios: {},
    publicaciones: {},
    contratos: {},
  })

  if (rol !== "ROLE_ADMIN") {
    return <PaginaNoEncontrada />
  }

  const handleFiltroChange = (
    tipo: Exclude<ReporteTipo, "resumen">,
    campo: keyof FiltrosFecha,
    valor: string
  ) => {
    setFiltros((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [campo]: valor || undefined },
    }))
  }

  const handleDescargar = async (params: DescargaParams) => {
    const key = `${params.tipo}-${params.formato}`
    setLoadingKey(key)
    try {
      const blob = await descargar(params).unwrap()
      downloadBlob(blob, buildFilename(params.tipo, params.formato))
      toast.success("Reporte descargado", {
        description: buildFilename(params.tipo, params.formato),
      })
    } catch {
      // El createBaseApi ya muestra el toast de error correspondiente
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Reportes del Sistema
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Exporta datos de la plataforma en formato Excel o PDF. Los filtros de
          fecha son opcionales; sin ellos se descarga el historial completo.
        </p>
      </div>

      {/* Resumen General */}
      <Card className="border-slate-200 bg-linear-to-r from-slate-900 to-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <AnalyticsUpIcon size={20} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">
                Resumen General
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Métricas globales: usuarios, publicaciones y contratos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 bg-white/15 text-white hover:bg-white/25"
            disabled={loadingKey !== null}
            onClick={() => handleDescargar({ tipo: "resumen", formato: "excel" })}
          >
            {loadingKey === "resumen-excel" ? (
              <Loading01Icon size={14} className="animate-spin" />
            ) : (
              <GoogleSheetIcon size={14} />
            )}
            Descargar Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 bg-white/15 text-white hover:bg-white/25"
            disabled={loadingKey !== null}
            onClick={() => handleDescargar({ tipo: "resumen", formato: "pdf" })}
          >
            {loadingKey === "resumen-pdf" ? (
              <Loading01Icon size={14} className="animate-spin" />
            ) : (
              <Pdf01Icon size={14} />
            )}
            Descargar PDF
          </Button>
        </CardFooter>
      </Card>

      {/* Reportes detallados */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700">
          Reportes Detallados
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReporteCard
            tipo="usuarios"
            titulo="Reporte de Usuarios"
            descripcion="Listado completo de usuarios, roles, perfiles y actividad."
            icon={<UserGroup03Icon size={16} />}
            filtros={filtros.usuarios}
            onFiltroChange={(campo, valor) =>
              handleFiltroChange("usuarios", campo, valor)
            }
            onDescargar={(formato) =>
              handleDescargar({
                tipo: "usuarios",
                formato,
                ...filtros.usuarios,
              })
            }
            loadingKey={loadingKey}
          />

          <ReporteCard
            tipo="publicaciones"
            titulo="Reporte de Publicaciones"
            descripcion="Inmuebles publicados con ubicación, precio y estado."
            icon={<Building04Icon size={16} />}
            filtros={filtros.publicaciones}
            onFiltroChange={(campo, valor) =>
              handleFiltroChange("publicaciones", campo, valor)
            }
            onDescargar={(formato) =>
              handleDescargar({
                tipo: "publicaciones",
                formato,
                ...filtros.publicaciones,
              })
            }
            loadingKey={loadingKey}
          />

          <ReporteCard
            tipo="contratos"
            titulo="Reporte de Contratos"
            descripcion="Contratos activos e históricos con montos y partes involucradas."
            icon={<ContractsIcon size={16} />}
            filtros={filtros.contratos}
            onFiltroChange={(campo, valor) =>
              handleFiltroChange("contratos", campo, valor)
            }
            onDescargar={(formato) =>
              handleDescargar({
                tipo: "contratos",
                formato,
                ...filtros.contratos,
              })
            }
            loadingKey={loadingKey}
          />
        </div>
      </div>

      {/* Asistente de Reportes */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700">
          Asistente de Reportes
        </h3>
        <ReporteChat />
      </div>
    </section>
  )
}
