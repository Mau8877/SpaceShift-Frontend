
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PasoUbicacion({ form }: { form: any }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-semibold text-foreground mb-6">Ubicación del Inmueble</h2>

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

        {<form.Field
          name="latitud"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Latitud</Label>
              <Input
                id={field.name}
                placeholder="Ej: 4.7110"
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
          name="longitud"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Longitud</Label>
              <Input
                id={field.name}
                placeholder="Ej: -74.0721"
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
    </div>
  )
}
