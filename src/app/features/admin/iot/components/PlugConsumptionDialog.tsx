import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useGetPlugPowerReadingsQuery, useGetPlugViolationsQuery } from "../store"
import type { TipoIncumplimiento } from "../types"

type PlugConsumptionDialogProps = {
  plug: { id: string; alias: string } | null
  onOpenChange: (open: boolean) => void
}

const TIPO_LABEL: Record<TipoIncumplimiento, string> = {
  HORARIO_LIMITE_EXCEDIDO: "Horario límite excedido",
  HORAS_CONTINUAS_EXCEDIDAS: "Horas continuas excedidas",
  DESCONEXION_SOSPECHOSA: "Desconexión sospechosa",
}

const chartConfig: ChartConfig = {
  curPower: { label: "Consumo (W)", color: "var(--chart-1)" },
}

const formatHora = (iso: string) =>
  new Date(iso).toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

export const PlugConsumptionDialog = ({ plug, onOpenChange }: PlugConsumptionDialogProps) => {
  const open = plug !== null

  const { data: lecturas = [], isLoading: isLoadingLecturas } = useGetPlugPowerReadingsQuery(
    { plugId: plug?.id ?? "", hours: 24 },
    { skip: !open }
  )
  const { data: violaciones = [], isLoading: isLoadingViolaciones } = useGetPlugViolationsQuery(
    plug?.id ?? "",
    { skip: !open }
  )

  const chartData = lecturas.map((l) => ({
    recordedAt: l.recordedAt,
    label: formatHora(l.recordedAt),
    curPower: l.curPower ?? 0,
  }))

  const puntosViolacion = violaciones
    .map((v) => {
      const masCercana = lecturas.reduce<typeof lecturas[number] | null>((closest, lectura) => {
        const diff = Math.abs(new Date(lectura.recordedAt).getTime() - new Date(v.detectedAt).getTime())
        const closestDiff = closest
          ? Math.abs(new Date(closest.recordedAt).getTime() - new Date(v.detectedAt).getTime())
          : Infinity
        return diff < closestDiff ? lectura : closest
      }, null)

      return masCercana ? { violacion: v, label: formatHora(masCercana.recordedAt), curPower: masCercana.curPower ?? 0 } : null
    })
    .filter((p): p is { violacion: typeof violaciones[number]; label: string; curPower: number } => p !== null)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Consumo de {plug?.alias}</DialogTitle>
          <DialogDescription>
            Lecturas de las últimas 24 horas. Los puntos rojos marcan incumplimientos detectados.
          </DialogDescription>
        </DialogHeader>

        {isLoadingLecturas ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay lecturas de consumo registradas para este enchufe.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={32} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="curPower"
                type="monotone"
                stroke="var(--color-curPower)"
                strokeWidth={2}
                dot={false}
              />
              {puntosViolacion.map((p) => (
                <ReferenceDot
                  key={p.violacion.id}
                  x={p.label}
                  y={p.curPower}
                  r={6}
                  fill="var(--destructive)"
                  stroke="none"
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Incumplimientos</p>
          <TooltipProvider>
            {isLoadingViolaciones ? (
              <Skeleton className="h-16 w-full" />
            ) : violaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No se registraron incumplimientos.</p>
            ) : (
              <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                {violaciones.map((v) => (
                  <div key={v.id} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="destructive">{TIPO_LABEL[v.tipo]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatHora(v.detectedAt)}
                      </span>
                    </div>
                    {v.detalle ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{v.detalle}</p>
                        </TooltipTrigger>
                        <TooltipContent>{v.detalle}</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
