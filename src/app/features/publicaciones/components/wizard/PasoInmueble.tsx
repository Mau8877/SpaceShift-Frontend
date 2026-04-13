
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PasoInmueble({ form }: { form: any }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-semibold text-foreground mb-6">Información del Inmueble</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TIPO INMUEBLE */}
        <form.Field
          name="tipoInmueble"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Tipo de Inmueble</Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val)}
              >
                <SelectTrigger id={field.name} className={field.state.meta.errors.length ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPARTAMENTO">Departamento</SelectItem>
                  <SelectItem value="CASA">Casa</SelectItem>
                  {/*<SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="local">Local Comercial</SelectItem>*/}
                </SelectContent>
              </Select>
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />

        {<form.Field
          name="areaTerreno"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Área de Terreno (m²)</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 120"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}

        {<form.Field
          name="areaConstruida"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Área Construida (m²)</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 85"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}

        {<form.Field
          name="habitaciones"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Habitaciones</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 3"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}

        {<form.Field
          name="banos"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Baños</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 2"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}

        {<form.Field
          name="garajes"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Garajes</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 1"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}

        {<form.Field
          name="antiguedadAnios"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Antigüedad (años)</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 5"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}
      </div>
    </div>
  )
}
