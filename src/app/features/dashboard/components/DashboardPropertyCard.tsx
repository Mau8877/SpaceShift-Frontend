import { Link } from "@tanstack/react-router"
import { Building03Icon } from "hugeicons-react"

import type { DashboardProperty } from "../types"

type DashboardPropertyCardProps = {
  property: DashboardProperty
}

const fallbackImage =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop"

const getOperationalStatusClassName = (
  status: DashboardProperty["estadoOperativo"]
) => {
  if (status === "DISPONIBLE") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }

  if (status === "OCUPADO") {
    return "bg-blue-50 text-blue-700 ring-blue-200"
  }

  return "bg-slate-50 text-slate-600 ring-slate-200"
}

const getPublicationStatusClassName = (status: string) => {
  if (status === "ACTIVO") {
    return "bg-amber-50 text-amber-700 ring-amber-200"
  }

  if (status === "INACTIVO") {
    return "bg-slate-50 text-slate-600 ring-slate-200"
  }

  return "bg-slate-50 text-slate-600 ring-slate-200"
}

const formatPrice = (moneda: string, precio: number) => {
  return `${moneda} ${precio.toLocaleString("es-BO")}`
}

export const DashboardPropertyCard = ({
  property,
}: DashboardPropertyCardProps) => {
  const imageUrl = property.imagenes?.[0]?.urlImage ?? fallbackImage

  const ubicacion =
    property.inmueble?.ubicacion?.zonaBarrios ||
    property.inmueble?.ubicacion?.ciudad ||
    "Sin ubicación"

  const tipoInmueble = property.inmueble?.tipoInmueble ?? "Inmueble"

  const price = formatPrice(property.moneda, property.precio)

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[330px] overflow-hidden">
        <img
          src={imageUrl}
          alt={property.titulo}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />

        <div className="absolute top-4 right-4 left-4 flex items-start justify-between gap-3">
          <div className="flex max-w-[68%] flex-wrap gap-2">
            <span className="rounded-full bg-indigo-950/95 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-sm backdrop-blur">
              {property.tipoTransaccion}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ring-1 backdrop-blur ${getPublicationStatusClassName(
                property.estadoPublicacion
              )}`}
            >
              {property.estadoPublicacion}
            </span>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold tracking-wide ring-1 backdrop-blur ${getOperationalStatusClassName(
              property.estadoOperativo
            )}`}
          >
            {property.estadoOperativo}
          </span>
        </div>

        <div className="absolute right-4 bottom-5 left-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/85">
            <Building03Icon size={16} />
            <span className="truncate">
              {ubicacion} · {tipoInmueble}
            </span>
          </div>

          <h3 className="line-clamp-2 max-w-[92%] text-2xl leading-tight font-bold tracking-tight text-white">
            {property.titulo}
          </h3>

          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="text-xl font-bold text-white">{price}</p>

            <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              {property.inmueble.areaConstruida} m²
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-950">
              {property.inmueble.habitaciones}
            </p>
            <p className="text-xs font-medium text-slate-500">Hab.</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-950">
              {property.inmueble.banos}
            </p>
            <p className="text-xs font-medium text-slate-500">Baños</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-950">
              {property.inmueble.garajes}
            </p>
            <p className="text-xs font-medium text-slate-500">Garajes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/publicacion/$id"
            params={{ id: property.id }}
            className="inline-flex items-center justify-center rounded-full bg-indigo-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-900"
          >
            Ver detalle
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Editar
          </button>
        </div>
      </div>
    </article>
  )
}
