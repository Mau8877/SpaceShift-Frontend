import { useMemo, type ReactNode } from "react"
import {
  Coins01Icon,
  FavouriteIcon,
  GoogleSheetIcon,
  Loading01Icon,
  Pdf01Icon,
} from "hugeicons-react"

import { useGetUsuariosQuery } from "@/app/features/admin/gestionar_usuarios/store/gestionarUsuariosApi"
import {
  type DescargaParams,
  useDescargarReporteMutation,
} from "@/app/features/admin/reportes/store/reportesApi"
import { useGetPublicacionesQuery } from "@/app/features/home/store/homeApi"
import {
  useGetMisFavoritosQuery,
  useGetMisPublicacionesQuery,
} from "@/app/features/publicaciones/store/publicacionApi"
import { useGetMiHistorialQuery, useGetMiSaldoQuery } from "@/app/features/tokens"
import { useAppSelector } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { DashboardDonutChartCard, DashboardKpiGrid } from "../components"
import type { DashboardChartItem, DashboardKpi } from "../types"

type DashboardPublication = {
  id: string
  titulo?: string | null
  precio?: number | null
  moneda?: string | null
  estadoPublicacion?: string | null
  fechaPublicacion?: string | null
  tipoTransaccion?: string | null
  inmueble?: {
    estadoOperativo?: string | null
  } | null
}

type DashboardFavorite = {
  id: string
}

type DashboardTransaction = {
  id: string
  cantidad: number
  tipo: string
  descripcion: string | null
  createdDate: string
}

type DashboardUser = {
  id: string
  nombre: string
  apellido?: string | null
  correo: string
  rol: string
  estado: boolean
}

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#ea580c",
  "#64748b",
]

const ACTIVE_PUBLICATION_STATES = new Set(["ACTIVO", "ACTIVA", "DISPONIBLE"])
const AVAILABLE_PROPERTY_STATES = new Set(["DISPONIBLE"])

const REPORT_BUTTONS: Array<{
  id: string
  label: string
  params: DescargaParams
  icon: typeof GoogleSheetIcon
}> = [
  {
    id: "usuarios-excel",
    label: "Descargar reporte de usuarios",
    params: { tipo: "usuarios", formato: "excel" },
    icon: GoogleSheetIcon,
  },
  {
    id: "publicaciones-excel",
    label: "Descargar reporte de publicaciones",
    params: { tipo: "publicaciones", formato: "excel" },
    icon: GoogleSheetIcon,
  },
  {
    id: "resumen-pdf",
    label: "Descargar resumen",
    params: { tipo: "resumen", formato: "pdf" },
    icon: Pdf01Icon,
  },
]

const normalizeLabel = (value?: string | null) => {
  if (!value) return "Sin dato"

  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  if (typeof amount !== "number") return "Sin precio"

  const formattedAmount = amount.toLocaleString("es-BO")
  return `${currency ?? "Bs."} ${formattedAmount}`
}

const getLatestItems = <T extends { [key: string]: unknown }>(
  items: T[],
  dateField: keyof T,
  limit = 5
) => {
  return [...items]
    .sort((a, b) => {
      const aDate = new Date(String(a[dateField] ?? "")).getTime()
      const bDate = new Date(String(b[dateField] ?? "")).getTime()
      return bDate - aDate
    })
    .slice(0, limit)
}

const createChartItems = <T extends { [key: string]: unknown }>(
  items: T[],
  getFieldValue: (item: T) => string | null | undefined
): DashboardChartItem[] => {
  const grouped = new Map<string, number>()

  items.forEach((item) => {
    const rawValue = getFieldValue(item)
    const key = normalizeLabel(rawValue)
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  })

  return Array.from(grouped.entries())
    .map(([label, value], index) => ({
      label,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}

const countAvailablePublications = (publicaciones: DashboardPublication[]) => {
  return publicaciones.filter((publicacion) => {
    const publicationState = String(publicacion.estadoPublicacion ?? "").toUpperCase()
    const propertyState = String(publicacion.inmueble?.estadoOperativo ?? "").toUpperCase()

    return (
      ACTIVE_PUBLICATION_STATES.has(publicationState) ||
      AVAILABLE_PROPERTY_STATES.has(propertyState)
    )
  }).length
}

const getUserRoleLabel = (rol?: string) => {
  if (rol === "ROLE_ADMIN") return "Administrador"
  if (rol === "ROLE_USER") return "Usuario"
  return rol || "Sin rol"
}

const getUserStateLabel = (isActive: boolean) => {
  return isActive ? "Activo" : "Inactivo"
}

const getFullName = (nombre?: string, apellido?: string | null) => {
  return [nombre, apellido].filter(Boolean).join(" ") || "Usuario sin nombre"
}

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

function getReportFilename({ tipo, formato }: DescargaParams) {
  const today = new Date().toISOString().split("T")[0]
  const extension = formato === "excel" ? "xlsx" : "pdf"
  return `reporte-${tipo}-${today}.${extension}`
}

export const DashboardScreen = () => {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = user?.rol === "ROLE_ADMIN"

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}

const UserDashboard = () => {
  const {
    data: misPublicaciones = [],
    isLoading: isLoadingPublicaciones,
    isError: publicacionesError,
  } = useGetMisPublicacionesQuery()
  const {
    data: favoritos = [],
    isLoading: isLoadingFavoritos,
    isError: favoritosError,
  } = useGetMisFavoritosQuery()
  const {
    data: saldoData,
    isLoading: isLoadingSaldo,
    isError: saldoError,
  } = useGetMiSaldoQuery()
  const {
    data: historial = [],
    isLoading: isLoadingHistorial,
    isError: historialError,
  } = useGetMiHistorialQuery()

  const publicaciones = misPublicaciones as DashboardPublication[]
  const favoritosData = favoritos as DashboardFavorite[]
  const historialData = historial as DashboardTransaction[]

  const publicacionesDisponibles = useMemo(
    () => countAvailablePublications(publicaciones),
    [publicaciones]
  )

  const kpis: DashboardKpi[] = useMemo(
    () => [
      {
        id: "mis-publicaciones",
        label: "Total de mis publicaciones",
        value: String(publicaciones.length),
        helper: "Registradas en tu cuenta",
      },
      {
        id: "publicaciones-disponibles",
        label: "Publicaciones activas/disponibles",
        value: String(publicacionesDisponibles),
        helper: "Visibles o disponibles actualmente",
      },
      {
        id: "mis-favoritos",
        label: "Mis favoritos",
        value: String(favoritosData.length),
        helper: "Inmuebles guardados por ti",
      },
      {
        id: "saldo-creditos",
        label: "Saldo de créditos",
        value: String(saldoData?.saldoCreditos ?? 0),
        helper: "Créditos SST disponibles",
      },
    ],
    [favoritosData.length, publicaciones.length, publicacionesDisponibles, saldoData?.saldoCreditos]
  )

  const publicacionesPorEstado = useMemo(
    () => createChartItems(publicaciones, (item) => item.estadoPublicacion),
    [publicaciones]
  )

  const publicacionesPorTipo = useMemo(
    () => createChartItems(publicaciones, (item) => item.tipoTransaccion),
    [publicaciones]
  )

  const ultimasPublicaciones = useMemo(
    () => getLatestItems(publicaciones, "fechaPublicacion", 5),
    [publicaciones]
  )

  const ultimasTransacciones = useMemo(
    () => getLatestItems(historialData, "createdDate", 5),
    [historialData]
  )

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Resumen general</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vista real de tus publicaciones, favoritos y créditos.
        </p>
      </div>

      {isLoadingPublicaciones || isLoadingFavoritos || isLoadingSaldo ? (
        <KpiGridSkeleton />
      ) : (
        <DashboardKpiGrid kpis={kpis} />
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartBlock
          title="Distribución por estado de publicación"
          description="Cómo se reparten tus publicaciones según su estado actual."
          isLoading={isLoadingPublicaciones}
          isError={publicacionesError}
          errorMessage="No se pudieron cargar tus publicaciones."
          emptyMessage="Aún no tienes publicaciones. Publica tu primer inmueble para ver métricas aquí."
          items={publicacionesPorEstado}
        />

        <ChartBlock
          title="Distribución por tipo de transacción"
          description="Agrupación dinámica según el tipo real de transacción."
          isLoading={isLoadingPublicaciones}
          isError={publicacionesError}
          errorMessage="No se pudieron agrupar tus publicaciones."
          emptyMessage="Aún no tienes publicaciones para analizar por tipo."
          items={publicacionesPorTipo}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PublicationListCard
          title="Últimas publicaciones"
          description="Tus 5 publicaciones más recientes."
          isLoading={isLoadingPublicaciones}
          isError={publicacionesError}
          errorMessage="No se pudieron cargar tus publicaciones."
          emptyMessage="Aún no tienes publicaciones. Publica tu primer inmueble para ver métricas aquí."
          items={ultimasPublicaciones}
        />

        <TransactionListCard
          title="Últimas transacciones de créditos"
          description="Movimientos recientes de tu saldo de créditos."
          isLoading={isLoadingHistorial}
          isError={historialError}
          errorMessage="No se pudo cargar tu historial de créditos."
          emptyMessage="Todavía no hay movimientos de créditos."
          items={ultimasTransacciones}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SimpleInfoCard
          title="Favoritos"
          description="Cantidad de inmuebles que guardaste como favoritos."
          isLoading={isLoadingFavoritos}
          isError={favoritosError}
          errorMessage="No se pudieron cargar tus favoritos."
        >
          {favoritosData.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <FavouriteIcon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950">{favoritosData.length}</p>
                <p className="text-sm text-slate-500">Favoritos guardados</p>
              </div>
            </div>
          ) : (
            <EmptyBlock message="Aún no tienes favoritos." />
          )}
        </SimpleInfoCard>

        <SimpleInfoCard
          title="Saldo actual"
          description="Créditos SST disponibles para futuras acciones."
          isLoading={isLoadingSaldo}
          isError={saldoError}
          errorMessage="No se pudo cargar el saldo."
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Coins01Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">
                {(saldoData?.saldoCreditos ?? 0).toLocaleString("es-BO")}
              </p>
              <p className="text-sm text-slate-500">Créditos disponibles</p>
            </div>
          </div>
        </SimpleInfoCard>
      </div>
    </section>
  )
}

const AdminDashboard = () => {
  const {
    data: usuariosData,
    isLoading: isLoadingUsuarios,
    isError: usuariosError,
  } = useGetUsuariosQuery({ page: 0, size: 5 })
  const {
    data: publicaciones = [],
    isLoading: isLoadingPublicaciones,
    isError: publicacionesError,
  } = useGetPublicacionesQuery()
  const [descargarReporte, { isLoading: isDownloadingReport }] =
    useDescargarReporteMutation()

  const publicacionesData = publicaciones as DashboardPublication[]
  const usuariosRecientes = (usuariosData?.content ?? []) as DashboardUser[]

  const kpis: DashboardKpi[] = useMemo(
    () => [
      {
        id: "total-usuarios",
        label: "Total de usuarios",
        value: String(usuariosData?.stats?.totalUsuarios ?? 0),
        helper: "Usuarios registrados en el sistema",
      },
      {
        id: "usuarios-activos",
        label: "Usuarios activos",
        value: String(usuariosData?.stats?.usuariosActivos ?? 0),
        helper: "Cuentas activas actualmente",
      },
      {
        id: "usuarios-inactivos",
        label: "Usuarios inactivos",
        value: String(usuariosData?.stats?.usuariosInactivos ?? 0),
        helper: "Cuentas desactivadas o inactivas",
      },
      {
        id: "total-publicaciones",
        label: "Total de publicaciones",
        value: String(
          usuariosData?.stats?.totalPublicaciones ?? publicacionesData.length
        ),
        helper: "Publicaciones registradas actualmente",
      },
    ],
    [
      publicacionesData.length,
      usuariosData?.stats?.totalPublicaciones,
      usuariosData?.stats?.totalUsuarios,
      usuariosData?.stats?.usuariosActivos,
      usuariosData?.stats?.usuariosInactivos,
    ]
  )

  const publicacionesPorEstado = useMemo(
    () => createChartItems(publicacionesData, (item) => item.estadoPublicacion),
    [publicacionesData]
  )

  const publicacionesPorTipo = useMemo(
    () => createChartItems(publicacionesData, (item) => item.tipoTransaccion),
    [publicacionesData]
  )

  const handleDownloadReport = async (params: DescargaParams) => {
    try {
      const blob = await descargarReporte(params).unwrap()
      downloadBlob(blob, getReportFilename(params))
    } catch {
      // El manejo global de errores ya notifica al usuario.
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Dashboard administrativo</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vista real de usuarios, publicaciones y accesos rápidos a reportes.
        </p>
      </div>

      {isLoadingUsuarios ? <KpiGridSkeleton /> : <DashboardKpiGrid kpis={kpis} />}

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartBlock
          title="Distribución global por estado"
          description="Agrupación de publicaciones según su estado actual."
          isLoading={isLoadingPublicaciones}
          isError={publicacionesError}
          errorMessage="No se pudieron cargar las publicaciones globales."
          emptyMessage="Todavía no hay publicaciones registradas."
          items={publicacionesPorEstado}
        />

        <ChartBlock
          title="Distribución global por tipo de transacción"
          description="Agrupación dinámica de publicaciones globales."
          isLoading={isLoadingPublicaciones}
          isError={publicacionesError}
          errorMessage="No se pudieron agrupar las publicaciones globales."
          emptyMessage="Todavía no hay publicaciones registradas."
          items={publicacionesPorTipo}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <UsersListCard
          title="Usuarios recientes"
          description="Primeros usuarios devueltos por la consulta administrativa."
          isLoading={isLoadingUsuarios}
          isError={usuariosError}
          errorMessage="No se pudieron cargar usuarios."
          items={usuariosRecientes}
        />

        <QuickReportsCard
          isLoading={false}
          isError={false}
          isDownloading={isDownloadingReport}
          onDownload={handleDownloadReport}
        />
      </div>
    </section>
  )
}

const ChartBlock = ({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  items,
}: {
  title: string
  description: string
  isLoading: boolean
  isError: boolean
  errorMessage: string
  emptyMessage: string
  items: DashboardChartItem[]
}) => {
  if (isLoading) {
    return <ChartSkeleton />
  }

  if (isError) {
    return <MessageCard title={title} message={errorMessage} />
  }

  if (items.length === 0) {
    return <MessageCard title={title} message={emptyMessage} />
  }

  return (
    <DashboardDonutChartCard
      title={title}
      description={description}
      items={items}
    />
  )
}

const PublicationListCard = ({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  items,
}: {
  title: string
  description: string
  isLoading: boolean
  isError: boolean
  errorMessage: string
  emptyMessage: string
  items: DashboardPublication[]
}) => {
  return (
    <SimpleInfoCard
      title={title}
      description={description}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    >
      {items.length === 0 ? (
        <EmptyBlock message={emptyMessage} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-950">
                    {item.titulo || "Publicación sin título"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatCurrency(item.precio, item.moneda)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{normalizeLabel(item.estadoPublicacion)}</Badge>
                  <span className="text-xs text-slate-500">
                    {formatDate(item.fechaPublicacion)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SimpleInfoCard>
  )
}

const TransactionListCard = ({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  items,
}: {
  title: string
  description: string
  isLoading: boolean
  isError: boolean
  errorMessage: string
  emptyMessage: string
  items: DashboardTransaction[]
}) => {
  return (
    <SimpleInfoCard
      title={title}
      description={description}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    >
      {items.length === 0 ? (
        <EmptyBlock message={emptyMessage} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-950">
                    {normalizeLabel(item.tipo)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.descripcion || "Sin descripción"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-950">
                    {item.cantidad.toLocaleString("es-BO")} créditos
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(item.createdDate)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SimpleInfoCard>
  )
}

const UsersListCard = ({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  items,
}: {
  title: string
  description: string
  isLoading: boolean
  isError: boolean
  errorMessage: string
  items: DashboardUser[]
}) => {
  return (
    <SimpleInfoCard
      title={title}
      description={description}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    >
      {items.length === 0 ? (
        <EmptyBlock message="No hay usuarios para mostrar en esta vista." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-slate-950">
                    {getFullName(item.nombre, item.apellido)}
                  </p>
                  <p className="text-sm text-slate-500">{item.correo}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{getUserRoleLabel(item.rol)}</Badge>
                  <Badge variant={item.estado ? "default" : "secondary"}>
                    {getUserStateLabel(item.estado)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SimpleInfoCard>
  )
}

const QuickReportsCard = ({
  isLoading,
  isError,
  isDownloading,
  onDownload,
}: {
  isLoading: boolean
  isError: boolean
  isDownloading: boolean
  onDownload: (params: DescargaParams) => Promise<void>
}) => {
  return (
    <SimpleInfoCard
      title="Accesos rápidos a reportes"
      description="Atajos para descargar reportes reales ya disponibles."
      isLoading={isLoading}
      isError={isError}
      errorMessage="No se pudieron preparar los accesos a reportes."
    >
      <div className="grid gap-3">
        {REPORT_BUTTONS.map((report) => {
          const Icon = report.icon

          return (
            <Button
              key={report.id}
              variant="outline"
              className="justify-start"
              disabled={isDownloading}
              onClick={() => void onDownload(report.params)}
            >
              {isDownloading ? (
                <Loading01Icon className="animate-spin" />
              ) : (
                <Icon />
              )}
              {report.label}
            </Button>
          )
        })}
      </div>
    </SimpleInfoCard>
  )
}

const SimpleInfoCard = ({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  children,
}: {
  title: string
  description: string
  isLoading: boolean
  isError: boolean
  errorMessage: string
  children: ReactNode
}) => {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-5">
        <CardTitle className="text-base font-semibold text-slate-950">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <EmptyBlock message={errorMessage} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

const MessageCard = ({ title, message }: { title: string; message: string }) => {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-5">
        <CardTitle className="text-base font-semibold text-slate-950">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-5">
        <EmptyBlock message={message} />
      </CardContent>
    </Card>
  )
}

const EmptyBlock = ({ message }: { message: string }) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {message}
    </div>
  )
}

const KpiGridSkeleton = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm"
        >
          <CardContent className="space-y-3 py-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const ChartSkeleton = () => {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="py-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="size-36 rounded-full" />
          <div className="grid flex-1 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ListSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-18 w-full rounded-xl" />
      ))}
    </div>
  )
}
