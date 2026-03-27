import * as React from "react"
import { fetchProperties } from "../properties/api"
import type { Property } from "../properties/columns"

export const HomePageScreen = () => {
  const [data, setData] = React.useState<Array<Property>>([])
  const [meta, setMeta] = React.useState({ totalRecords: 0, pageCount: 0 })
  const [loading, setLoading] = React.useState(false)

  const [page, setPage] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const loadData = async () => {
    setLoading(true)
    try {
      // Pasamos los parámetros actuales a la "API"
      const response = await fetchProperties({
        pageIndex: page,
        pageSize: 10,
        search: search, // Este valor solo se envía cuando llamas a loadData
        status: status,
      })
      setData(response.data)
      setMeta({
        totalRecords: response.totalRecords,
        pageCount: response.pageCount,
      })
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Escuchamos cambios en página y estado para recargar
  // Pero NO escuchamos el 'search' aquí para evitar el disparo automático
  React.useEffect(() => {
    loadData()
  }, [page, status])

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-10 font-mono text-sm">
      <div className="flex items-center justify-between">
        <h1 className="border-b-2 border-primary pb-1 text-xl font-bold">
          LABORATORIO API MOCK
        </h1>
        {loading && (
          <span className="animate-pulse font-bold text-primary">
            🔄 PETICIÓN EN CURSO...
          </span>
        )}
      </div>

      {/* --- PANEL DE CONTROL --- */}
      <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <input
            className="w-64 rounded-md border border-border bg-background p-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
            placeholder="Escribe el nombre del inmueble..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
          />
          <button
            onClick={loadData}
            className="rounded-md bg-primary px-6 py-2 font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            FILTRAR (ENTER)
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select
            className="rounded-md border border-border bg-background p-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(0) // Resetear a pág 1 al filtrar
            }}
          >
            <option value="all">Todos los Estados</option>
            <option value="processed">PROCESADOS</option>
            <option value="pending">PENDIENTES</option>
            <option value="error">ERRORES</option>
          </select>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-slate-100 p-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded border bg-white px-3 py-1 disabled:opacity-50"
            >
              PREV
            </button>
            <span className="font-bold">
              Página {page + 1} de {meta.pageCount || 1}
            </span>
            <button
              disabled={page >= meta.pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border bg-white px-3 py-1 disabled:opacity-50"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* --- MONITOR --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-xs font-black text-muted-foreground uppercase">
            JSON Data Stream:
          </h2>
          <div className="h-[450px] overflow-auto rounded-xl border border-border bg-[#1e1e1e] p-4 text-[#9cdcfe]">
            <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-black text-muted-foreground uppercase">
            API Metadata:
          </h2>
          <div className="rounded-xl border border-border bg-[#1e1e1e] p-4 text-[#ce9178]">
            <pre className="text-xs">
              {JSON.stringify(
                {
                  peticion: {
                    page_index: page,
                    search_term: search,
                    filter_status: status,
                  },
                  respuesta: {
                    registros_totales: meta.totalRecords,
                    paginas_calculadas: meta.pageCount,
                    items_en_vuelo: data.length,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
