import { lazy, Suspense, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

// Carga solo en cliente: leaflet asume `window` apenas se importa y rompe el render SSR
const LocationMap = lazy(() => import("./LocationMap"))

export function PasoUbicacion({ form }: { form: any }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-semibold text-foreground mb-4">Ubicación del Inmueble</h2>

      {/* Fila 1: Ciudad, Zona/Barrio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {<form.Field
          name="ciudad"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Ciudad</Label>
              <Input
                id={field.name}
                placeholder="Ej: Bogotá"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
            </div>
          )}
        />}

        {<form.Field
          name="zonaBarrios"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Zona o Barrio</Label>
              <Input
                id={field.name}
                placeholder="Ej: Chapinero"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
            </div>
          )}
        />}
      </div>

      {/* Fila 2: Dirección Exacta (Ocupa toda la fila) */}
      <div className="w-full">
        {<form.Field
          name="direccionExacta"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Dirección Exacta</Label>
              <Input
                id={field.name}
                placeholder="Ej: Carrera 7 # 120-45"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
            </div>
          )}
        />}
      </div>

      {/* Sección Mapa (Fila 3) */}
      <div className="space-y-2">
        <Label>Posición en el Mapa (Haz clic para seleccionar)</Label>
        
        {/* Renderizamos el mapa estéticamente */}
        <div className="w-full h-72 rounded-xl overflow-hidden border border-border shadow-sm z-0">
          {mounted ? (
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <LocationMap form={form} />
            </Suspense>
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>
      </div>

      {/* Fila 4: Inputs de Latitud/Longitud Bloqueados Estéticos y Validación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {<form.Field
          name="latitud"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-muted-foreground flex items-center justify-between">
                <span>Latitud Mapeada</span>
              </Label>
              <Input
                id={field.name}
                readOnly
                placeholder="Seleccione en el mapa"
                value={field.state.value}
                className="bg-muted/50 cursor-default text-muted-foreground"
              />
              {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
            </div>
          )}
        />}

        {<form.Field
          name="longitud"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-muted-foreground flex items-center justify-between">
                <span>Longitud Mapeada</span>
              </Label>
              <Input
                id={field.name}
                readOnly
                placeholder="Seleccione en el mapa"
                value={field.state.value}
                className="bg-muted/50 cursor-default text-muted-foreground"
              />
              {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
            </div>
          )}
        />}
      </div>

    </div>
  )
}
