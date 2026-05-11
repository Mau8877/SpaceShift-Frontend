import {
  Calendar01Icon,
  GoogleSheetIcon,
  Loading01Icon,
  Pdf01Icon,
} from "hugeicons-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { type ReporteFormato, type ReporteTipo } from "../store/reportesApi"

export type FiltrosFecha = { fechaInicio?: string; fechaFin?: string }

export type ReporteCardProps = {
  tipo: ReporteTipo
  titulo: string
  descripcion: string
  icon: React.ReactNode
  mostrarFiltros?: boolean
  filtros: FiltrosFecha
  onFiltroChange: (campo: keyof FiltrosFecha, valor: string) => void
  onDescargar: (formato: ReporteFormato) => Promise<void>
  loadingKey: string | null
}

function today() {
  return new Date().toISOString().split("T")[0]
}

export function ReporteCard({
  tipo,
  titulo,
  descripcion,
  icon,
  mostrarFiltros = true,
  filtros,
  onFiltroChange,
  onDescargar,
  loadingKey,
}: ReporteCardProps) {
  const excelKey = `${tipo}-excel`
  const pdfKey = `${tipo}-pdf`

  return (
    <Card className="flex flex-col border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              {titulo}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-slate-500">
              {descripcion}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {mostrarFiltros && (
        <>
          <Separator className="mx-6 w-auto" />
          <CardContent className="pt-4">
            <p className="mb-3 text-xs font-medium text-slate-500">
              Filtrar por fecha (opcional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`${tipo}-inicio`}
                  className="flex items-center gap-1 text-xs text-slate-600"
                >
                  <Calendar01Icon size={12} />
                  Desde
                </Label>
                <Input
                  id={`${tipo}-inicio`}
                  type="date"
                  className="h-8 text-xs"
                  value={filtros.fechaInicio ?? ""}
                  max={filtros.fechaFin ?? today()}
                  onChange={(e) => onFiltroChange("fechaInicio", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`${tipo}-fin`}
                  className="flex items-center gap-1 text-xs text-slate-600"
                >
                  <Calendar01Icon size={12} />
                  Hasta
                </Label>
                <Input
                  id={`${tipo}-fin`}
                  type="date"
                  className="h-8 text-xs"
                  value={filtros.fechaFin ?? ""}
                  min={filtros.fechaInicio}
                  max={today()}
                  onChange={(e) => onFiltroChange("fechaFin", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </>
      )}

      <CardFooter className="mt-auto flex gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          disabled={loadingKey !== null}
          onClick={() => onDescargar("excel")}
        >
          {loadingKey === excelKey ? (
            <Loading01Icon size={14} className="animate-spin" />
          ) : (
            <GoogleSheetIcon size={14} />
          )}
          Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          disabled={loadingKey !== null}
          onClick={() => onDescargar("pdf")}
        >
          {loadingKey === pdfKey ? (
            <Loading01Icon size={14} className="animate-spin" />
          ) : (
            <Pdf01Icon size={14} />
          )}
          PDF
        </Button>
      </CardFooter>
    </Card>
  )
}
