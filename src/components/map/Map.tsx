import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import { CITY_CENTER, DEFAULT_ZOOM } from '@/lib/constants'

// أيقونة مخصصة بنمط المنصة
const icon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
      <path fill="#054239" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 14 8 14s8-8.75 8-14c0-4.42-3.58-8-8-8z"/>
      <circle cx="12" cy="8" r="3" fill="#fff"/>
    </svg>`),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
})

interface Props {
  lat?: number | null
  lng?: number | null
  onSelect?: (lat: number, lng: number) => void
  interactive?: boolean
  markers?: Array<{
    lat: number
    lng: number
    title: string
    subtitle?: string
  }>
  markerColor?: string
}

function ClickHandler({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function CenterSetter({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16))
    }
  }, [lat, lng, map])
  return null
}

interface BaseMapProps {
  className?: string
}

export default function MapView({
  lat,
  lng,
  onSelect,
  interactive = false,
  markers = [],
  className = 'h-[420px]',
}: Props & BaseMapProps) {
  return (
    <MapContainer
      center={[CITY_CENTER.lat, CITY_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className={className}
      style={{ width: '100%' }}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {interactive && onSelect && <ClickHandler onSelect={onSelect} />}
      {lat != null && lng != null && (
        <>
          <CenterSetter lat={lat} lng={lng} />
          <Marker position={[lat, lng]} icon={icon}>
            {interactive && (
              <Popup>الموقع المحدد: {lat.toFixed(5)}، {lng.toFixed(5)}</Popup>
            )}
          </Marker>
        </>
      )}
      {markers.map((m) => (
        <Marker key={`${m.lat}-${m.lng}-${m.title}`} position={[m.lat, m.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{m.title}</p>
              {m.subtitle && <p className="text-xs text-ink-secondary">{m.subtitle}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}