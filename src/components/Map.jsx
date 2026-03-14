import { Fragment } from 'react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const AMSTERDAM      = [52.3676, 4.9041]
const DEFAULT_ZOOM   = 13
const STALE_MS       = 5 * 60 * 60 * 1000  // 5 heures

function getHeatColor(occupancy) {
  if (occupancy >= 70) return '#ef4444'
  if (occupancy >= 40) return '#f59e0b'
  return '#10b981'
}

function getGlowClass(occupancy) {
  if (occupancy >= 70) return 'dot-glow-red'
  if (occupancy >= 40) return 'dot-glow-orange'
  return 'dot-glow-green'
}

function isStale(lastUpdated) {
  if (!lastUpdated) return true
  return Date.now() - new Date(lastUpdated).getTime() > STALE_MS
}

export default function Map({ libraries = [], onSelect }) {
  return (
    <div className="w-full h-full">
      <MapContainer
        center={AMSTERDAM}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {libraries.map((lib) => {
          const stale     = isStale(lib.lastUpdated)
          const color     = stale ? '#9ca3af' : getHeatColor(lib.occupancy ?? 50)
          const glowClass = stale ? ''         : getGlowClass(lib.occupancy ?? 50)
          const dotOpacity = stale ? 0.45 : 1

          return (
            <Fragment key={lib.id}>
              {/* Halo doux */}
              <CircleMarker
                center={[lib.lat, lib.lng]}
                radius={18}
                pathOptions={{
                  color:       'transparent',
                  fillColor:   color,
                  fillOpacity: stale ? 0.07 : 0.15,
                  weight:      0,
                }}
              />

              {/* Anneau pulsant — uniquement si signalement récent ET pas périmé */}
              {lib.recentReport && !stale && (
                <CircleMarker
                  center={[lib.lat, lib.lng]}
                  radius={10}
                  pathOptions={{
                    color,
                    fill:      false,
                    weight:    2,
                    className: 'pulse-ring',
                  }}
                />
              )}

              {/* Point principal — click → bottom sheet */}
              <CircleMarker
                center={[lib.lat, lib.lng]}
                radius={7}
                pathOptions={{
                  color:       'white',
                  fillColor:   color,
                  fillOpacity: dotOpacity,
                  weight:      2,
                  className:   `${glowClass} cursor-pointer`,
                }}
                eventHandlers={{
                  click: () => onSelect?.(lib),
                }}
              />
            </Fragment>
          )
        })}
      </MapContainer>
    </div>
  )
}
