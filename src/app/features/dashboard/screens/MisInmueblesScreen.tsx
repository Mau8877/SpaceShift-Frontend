import { useMemo, useState } from "react"

import {
  DashboardPropertyCard,
  MisInmueblesFilters,
  MisInmueblesSummary,
} from "../components"
import { useGetMisPublicacionesQuery } from "../../publicaciones/store/publicacionApi"
import type { PropertyFilterStatus, PropertyFilterTransaction } from "../types"

export const MisInmueblesScreen = () => {
  const { data: misPublicaciones = [], isLoading } = useGetMisPublicacionesQuery()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<PropertyFilterStatus>("TODOS")
  const [transaction, setTransaction] =
    useState<PropertyFilterTransaction>("TODOS")

  const summary = useMemo(() => {
    return {
      total: misPublicaciones.length,
      disponibles: misPublicaciones.filter(
        (property) => property.inmueble.estadoOperativo === "DISPONIBLE" && property.estadoPublicacion !== "ELIMINADO"
      ).length,
      ocupados: misPublicaciones.filter(
        (property) => property.inmueble.estadoOperativo === "OCUPADO"
      ).length,
      inactivos: misPublicaciones.filter(
        (property) => property.estadoPublicacion === "INACTIVO" || property.estadoPublicacion === "ELIMINADO" || property.inmueble.estadoOperativo === "INACTIVO"
      ).length,
    }
  }, [misPublicaciones])

  const filteredProperties = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return misPublicaciones.filter((property: any) => {
      if (status !== "TODOS") {
        const est = property.estadoPublicacion;
        if (status === "DISPONIBLE") {
          if (est !== "DISPONIBLE" && est !== "ACTIVO" && est !== "ACTIVA") return false;
        } else if (status === "OCUPADO") {
          if (est !== "OCUPADO") return false;
        } else if (status === "INACTIVO") {
          if (est !== "INACTIVO" && est !== "ELIMINADO") return false;
        }
      }

      if (transaction !== "TODOS" && property.tipoTransaccion !== transaction) {
        return false
      }

      if (!searchValue) {
        return true
      }

      const searchableText = [
        property.titulo,
        property.tipoTransaccion,
        property.estadoPublicacion,
        property.inmueble.estadoOperativo,
        property.inmueble.tipoInmueble,
        property.inmueble.ubicacion.ciudad,
        property.inmueble.ubicacion.zonaBarrios,
        property.inmueble.ubicacion.direccionExacta,
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(searchValue)
    })
  }, [search, status, transaction, misPublicaciones])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-950 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Mis inmuebles registrados
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Consulta, filtra y administra las propiedades que tienes registradas.
        </p>
      </div>

      <MisInmueblesSummary
        total={summary.total}
        inactivos={summary.inactivos}
        disponibles={summary.disponibles}
        ocupados={summary.ocupados}
      />

      <MisInmueblesFilters
        search={search}
        status={status}
        transaction={transaction}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onTransactionChange={setTransaction}
      />

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <DashboardPropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No se encontraron inmuebles.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Prueba cambiando los filtros o el texto de búsqueda.
          </p>
        </div>
      )}
    </section>
  )
}
