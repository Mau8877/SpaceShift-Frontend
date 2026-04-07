import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Corrección Fix para iconos rotos de Leaflet en Vite/React
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"
import iconRetina from "leaflet/dist/images/marker-icon-2x.png"

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
})
L.Marker.prototype.options.icon = DefaultIcon

// Coordenadas por defecto (Santa Cruz de la Sierra, Bolivia)
const DEFAULT_CENTER: [number, number] = [-17.7833, -63.1821]

// Subcomponente que intercepta los clics en el mapa
function LocationMarker({ form }: { form: any }) {
  const lat = form.getFieldValue("latitud")
  const lng = form.getFieldValue("longitud")

  const position = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null

  useMapEvents({
    click(e) {
      form.setFieldValue("latitud", e.latlng.lat.toString())
      form.setFieldValue("longitud", e.latlng.lng.toString())
    },
  })

  return position === null ? null : <Marker position={position} />
}


export function PasoUbicacion({ form }: { form: any }) {
  
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
          <MapContainer 
            center={DEFAULT_CENTER} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%', zIndex: 10 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker form={form} />
          </MapContainer>
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
