
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PasoDetalles({ form }: { form: any }) {
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
                value={field.state.value === 0 ? "" : field.state.value}
                onChange={(e) => field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))}
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
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                  <SelectItem value="anticretico">Anticrético</SelectItem>
                  <SelectItem value="alojamiento">Alojamiento</SelectItem>
                </SelectContent>
              </Select>
              {field.state.meta.errors ? (
                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        />}
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Dispositivos del inmueble</h3>
          <p className="text-xs text-slate-500">
            Registra el catalogo de objetos o dispositivos que podran incluirse despues en un contrato.
          </p>
        </div>

        <form.Field
          name="dispositivos"
          children={(field: any) => {
            const devices = Array.isArray(field.state.value) ? field.state.value : []
            const updateDevice = (index: number, key: string, value: any) => {
              field.handleChange(
                devices.map((device: any, currentIndex: number) =>
                  currentIndex === index ? { ...device, [key]: value } : device
                )
              )
            }

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Dispositivos inteligentes alquilables</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      field.handleChange([
                        ...devices,
                        {
                          id: crypto.randomUUID(),
                          nombre: "",
                          configuracionTiempo: "LIBRE",
                          horarioInicio: "00:00",
                          horarioFin: "23:59",
                          descripcion: "",
                        },
                      ])
                    }
                  >
                    Agregar dispositivo
                  </Button>
                </div>

                {devices.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                    No hay dispositivos registrados para este inmueble.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {devices.map((device: any, index: number) => (
                      <div key={device.id || index} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Nombre</Label>
                            <Input
                              value={device.nombre || ""}
                              placeholder="Ej: Altavoz inteligente Alexa"
                              onChange={(e) => updateDevice(index, "nombre", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Configuracion de tiempo</Label>
                            <Select
                              value={device.configuracionTiempo || "LIBRE"}
                              onValueChange={(value) => updateDevice(index, "configuracionTiempo", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LIBRE">Libre</SelectItem>
                                <SelectItem value="HORARIO">Por horario</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Horario inicio</Label>
                            <Input
                              type="time"
                              value={device.horarioInicio || ""}
                              onChange={(e) => updateDevice(index, "horarioInicio", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Horario fin</Label>
                            <Input
                              type="time"
                              value={device.horarioFin || ""}
                              onChange={(e) => updateDevice(index, "horarioFin", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label>Descripcion</Label>
                            <Textarea
                              rows={2}
                              value={device.descripcion || ""}
                              placeholder="Ej: Control de musica y luces por voz."
                              onChange={(e) => updateDevice(index, "descripcion", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => field.handleChange(devices.filter((_: any, currentIndex: number) => currentIndex !== index))}
                          >
                            Eliminar dispositivo
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
