
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

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
            Registra el catálogo de dispositivos que podrán incluirse en un contrato. Define el precio por día y las condiciones de uso.
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
                          precioPorDia: 0,
                          maxHorasSeguidas: 0,
                          horarioLimiteUso: "",
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
                            <Label>Precio por día (Bs.)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={device.precioPorDia ?? 0}
                              placeholder="Ej: 15"
                              onChange={(e) => updateDevice(index, "precioPorDia", Number(e.target.value))}
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

                        {/* Condiciones de uso del dispositivo */}
                        <div className="mt-4 border-t border-slate-100 pt-3 space-y-4">
                          <p className="text-xs font-bold text-slate-700">Restricciones y Condiciones de Uso</p>
                          
                          <div className="space-y-3">
                            {/* Checkbox 1: Limitar horas continuas */}
                            <div className="flex items-start gap-2.5">
                              <Checkbox 
                                id={`max-hours-toggle-${device.id || index}`}
                                checked={device.maxHorasSeguidas != null && device.maxHorasSeguidas > 0}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateDevice(index, "maxHorasSeguidas", 2) // default 2 hours
                                  } else {
                                    updateDevice(index, "maxHorasSeguidas", 0)
                                  }
                                }}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label 
                                  htmlFor={`max-hours-toggle-${device.id || index}`}
                                  className="text-xs font-medium text-slate-700 cursor-pointer"
                                >
                                  Limitar horas continuas de uso consecutivo
                                </Label>
                                <p className="text-[10px] text-slate-400">
                                  Restringe la cantidad máxima de horas que el dispositivo se puede mantener encendido de forma continua.
                                </p>
                              </div>
                            </div>

                            {/* Input para horas continuas */}
                            {device.maxHorasSeguidas != null && device.maxHorasSeguidas > 0 && (
                              <div className="pl-6 max-w-[200px] space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500">Máximo horas continuas</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="24"
                                  value={device.maxHorasSeguidas || ""}
                                  placeholder="Ej: 2"
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? 0 : Number(e.target.value)
                                    updateDevice(index, "maxHorasSeguidas", val)
                                  }}
                                  className="h-8 text-xs"
                                />
                              </div>
                            )}

                            {/* Checkbox 2: Limitar hora máxima (Horario límite) */}
                            <div className="flex items-start gap-2.5">
                              <Checkbox 
                                id={`time-limit-toggle-${device.id || index}`}
                                checked={device.horarioLimiteUso != null && device.horarioLimiteUso !== ""}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateDevice(index, "horarioLimiteUso", "22:00") // default 22:00
                                  } else {
                                    updateDevice(index, "horarioLimiteUso", "")
                                  }
                                }}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label 
                                  htmlFor={`time-limit-toggle-${device.id || index}`}
                                  className="text-xs font-medium text-slate-700 cursor-pointer"
                                >
                                  Establecer un horario límite nocturno
                                </Label>
                                <p className="text-[10px] text-slate-400">
                                  Define una hora a partir de la cual el dispositivo dejará de estar disponible para su uso.
                                </p>
                              </div>
                            </div>

                            {/* Input para horario limite */}
                            {device.horarioLimiteUso != null && device.horarioLimiteUso !== "" && (
                              <div className="pl-6 max-w-[200px] space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500">Hora límite (No permitir después de)</Label>
                                <Input
                                  type="time"
                                  value={device.horarioLimiteUso || ""}
                                  onChange={(e) => updateDevice(index, "horarioLimiteUso", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </div>
                            )}
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

      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 mt-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Reglas del inmueble y Sanciones</h3>
          <p className="text-xs text-slate-500">
            Define las normas que deberán cumplir los inquilinos y las consecuencias (multas o sanciones) en caso de infringirlas. Esto quedará registrado en el contrato final.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.Field
            name="condiciones"
            children={(field: any) => (
              <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <Label htmlFor={field.name} className="text-xs font-semibold text-slate-700">Reglas y Condiciones del Inmueble</Label>
                <Textarea
                  id={field.name}
                  placeholder="Ej: No se permiten mascotas. Cuidar las plantas del jardín. No hacer ruido después de las 22:00."
                  rows={4}
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="text-xs"
                />
              </div>
            )}
          />

          <form.Field
            name="multasSanciones"
            children={(field: any) => (
              <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <Label htmlFor={field.name} className="text-xs font-semibold text-slate-700">Multas y Sanciones por Incumplimiento</Label>
                <Textarea
                  id={field.name}
                  placeholder="Ej: Multa de $50 USD por infringir la regla de ruido. Cobro por daños a los electrodomésticos."
                  rows={4}
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="text-xs"
                />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
