import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Corrección Fix para iconos rotos de Leaflet en Vite/React
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"
import iconRetina from "leaflet/dist/images/marker-icon-2x.png"

const DefaultIcon = L.icon({
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
  return (
    <form.Subscribe
      selector={(state: any) => [state.values.latitud, state.values.longitud]}
      children={([latitud, longitud]: [string, string]) => {
        const position = latitud && longitud ? [Number(latitud), Number(longitud)] : null

        return (
          <>
            <MapClickHandler form={form} />
            {position && <Marker position={position as any} />}
          </>
        )
      }}
    />
  )
}

function MapClickHandler({ form }: { form: any }) {
  useMapEvents({
    click(e) {
      form.setFieldValue("latitud", e.latlng.lat.toString())
      form.setFieldValue("longitud", e.latlng.lng.toString())
    },
  })
  return null
}

// Este módulo solo debe cargarse en cliente (leaflet asume `window` apenas se importa,
// lo que rompe el render SSR). Por eso se carga vía dynamic import, nunca de forma estática.
export default function LocationMap({ form }: { form: any }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker form={form} />
    </MapContainer>
  )
}
