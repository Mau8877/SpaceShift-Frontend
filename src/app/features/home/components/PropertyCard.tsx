import * as React from "react"
import {
  MapsLocation01Icon,
  DollarCircleIcon,
  Home01Icon,
  ArrowRight01Icon,
} from "hugeicons-react"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface Inmueble {
  id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  precio: number;
  estado: string;
  categoria: string;
}

export function PropertyCard({ data }: { data: Inmueble }) {
  // Imagen de placeholder premium (Arquitectura moderna)
  const imageUrl = ""

  return (
    <Card className="group overflow-hidden rounded-[32px] border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950">
      {/* Contenedor de Imagen */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={data.titulo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
            {data.categoria}
          </Badge>
          <Badge className={data.estado === "Disponible" ? "bg-green-500/90 text-white backdrop-blur-sm rounded-full px-3 py-1 font-bold text-[10px]" : "bg-slate-500/90 text-white backdrop-blur-sm rounded-full px-3 py-1 font-bold text-[10px]"}>
            {data.estado}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="line-clamp-1 text-lg font-bold text-slate-800 dark:text-slate-100">
            {data.titulo}
          </h3>
          <div className="flex items-center gap-1 text-primary">
            <DollarCircleIcon size={20} />
            <span className="text-lg font-black tracking-tight">{data.precio.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {data.descripcion}
          </p>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MapsLocation01Icon size={16} className="text-primary" />
            <span className="text-xs font-medium">{data.ubicacion}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Home01Icon size={16} className="text-primary" />
            <span className="text-xs font-medium capitalize">{data.categoria} en SpaceShift</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-6 pt-0">
        <Button variant="outline" className="flex-1 rounded-full border-slate-200 font-bold hover:bg-slate-50 h-11 text-xs uppercase tracking-wider">
          Detalles
        </Button>
        <Button className="flex-1 rounded-full bg-primary font-bold shadow-lg hover:shadow-primary/20 h-11 text-xs uppercase tracking-wider gap-2">
          Contactar
          <ArrowRight01Icon size={16} />
        </Button>
      </CardFooter>
    </Card>
  )
}
