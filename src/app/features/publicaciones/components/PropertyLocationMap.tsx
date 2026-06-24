import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer } from "react-leaflet"

// Fix para iconos de Leaflet en Vite
import iconRetina from "leaflet/dist/images/marker-icon-2x.png"
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

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

type PropertyLocationMapProps = {
  latitud: number
  longitud: number
  className?: string
}

// Este módulo solo debe cargarse en cliente (leaflet asume `window` apenas se importa,
// lo que rompe el render SSR). Por eso se carga vía dynamic import, nunca de forma estática.
export default function PropertyLocationMap({ latitud, longitud, className }: PropertyLocationMapProps) {
  return (
    <MapContainer
      center={[latitud, longitud]}
      zoom={15}
      scrollWheelZoom={false}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitud, longitud]} />
    </MapContainer>
  )
}
