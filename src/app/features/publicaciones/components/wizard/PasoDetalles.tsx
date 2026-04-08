
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

export function PasoDetalles({ form }: { form: any }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-semibold text-foreground mb-6">Detalles de la Publicación</h2>

      {<form.Field
        name="titulo"
        children={(field: any) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Título de la Publicación</Label>
            <Input
              id={field.name}
              placeholder="Ej: Hermoso apartamento en Chapinero"
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
        name="descripcionGeneral"
        children={(field: any) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Descripción General</Label>
            <Textarea
              id={field.name}
              placeholder="Describe la propiedad, características especiales, servicios..."
              rows={4}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className={field.state.meta.errors.length ? "border-red-500" : ""}
            />
            {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
          </div>
        )}
      />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {<form.Field
          name="precio"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Precio {form.getFieldValue("moneda") && `(${form.getFieldValue("moneda")})`}</Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Ej: 350000000"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length ? "border-red-500" : ""}
              />
              {field.state.meta.errors ? <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p> : null}
            </div>
          )}
        />}

        {<form.Field
          name="tipoTransaccion"
          children={(field: any) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Tipo de Transacción</Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val)}
              >
                <SelectTrigger id={field.name} className={field.state.meta.errors.length ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENTA">Venta</SelectItem>
                  <SelectItem value="ARRIENDO">Arriendo</SelectItem>
                  <SelectItem value="VENTA_ARRIENDO">Venta / Arriendo</SelectItem>
                </SelectContent>
              </Select>
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
