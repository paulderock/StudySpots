import { Fragment, useState, useCallback } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const AMSTERDAM    = [52.3676, 4.9041]
const DEFAULT_ZOOM = 13
const STALE_MS     = 5 * 60 * 60 * 1000  // 5 heures

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

/* ── Composant interne : accède au contexte Leaflet via useMap() ── */
function LocateControl({ onLocated }) {
  const map      = useMap()
  const [state, setState] = useState('idle') // idle | loading | error

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) return
    setState('loading')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        map.flyTo([lat, lng], 16, { duration: 1.2 })
        onLocated([lat, lng])
        setState('idle')
      },
      () => {
        setState('error')
        setTimeout(() => setState('idle'), 3000)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [map, onLocated])

  return (
    <div
      style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 1000 }}
    >
      <button
        onClick={handleClick}
        title="Me localiser"
        style={{
          width: 44, height: 44,
          borderRadius: '50%',
          border: 'none',
          background: state === 'error' ? '#ef4444' : 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          cursor: state === 'loading' ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {state === 'loading' ? (
          /* Spinner SVG */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"
               style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : state === 'error' ? (
          /* Croix erreur */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          /* Icône crosshair */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" fill="#3b82f6" fillOpacity="0.25"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            <circle cx="12" cy="12" r="8"/>
          </svg>
        )}
      </button>
    </div>
  )
}

/* ── Composant principal ─────────────────────────────────────────── */
export default function Map({ libraries = [], onSelect }) {
  const [userPos, setUserPos] = useState(null)

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
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

        {/* Marqueurs bibliothèques */}
        {libraries.map((lib) => {
          const stale      = isStale(lib.lastUpdated)
          const color      = stale ? '#9ca3af' : getHeatColor(lib.occupancy ?? 50)
          const glowClass  = stale ? ''        : getGlowClass(lib.occupancy ?? 50)
          const dotOpacity = stale ? 0.45 : 1

          return (
            <Fragment key={lib.id}>
              <CircleMarker
                center={[lib.lat, lib.lng]}
                radius={18}
                pathOptions={{
                  color: 'transparent', fillColor: color,
                  fillOpacity: stale ? 0.07 : 0.15, weight: 0,
                }}
              />
              {lib.recentReport && !stale && (
                <CircleMarker
                  center={[lib.lat, lib.lng]}
                  radius={10}
                  pathOptions={{ color, fill: false, weight: 2, className: 'pulse-ring' }}
                />
              )}
              <CircleMarker
                center={[lib.lat, lib.lng]}
                radius={7}
                pathOptions={{
                  color: 'white', fillColor: color,
                  fillOpacity: dotOpacity, weight: 2,
                  className: `${glowClass} cursor-pointer`,
                }}
                eventHandlers={{ click: () => onSelect?.(lib) }}
              />
            </Fragment>
          )
        })}

        {/* Point bleu — position utilisateur */}
        {userPos && (
          <Fragment>
            {/* Halo pulsant */}
            <CircleMarker
              center={userPos}
              radius={14}
              pathOptions={{
                color: 'transparent', fillColor: '#3b82f6',
                fillOpacity: 0.15, weight: 0,
              }}
            />
            {/* Point central */}
            <CircleMarker
              center={userPos}
              radius={7}
              pathOptions={{
                color: 'white', fillColor: '#3b82f6',
                fillOpacity: 1, weight: 2.5,
              }}
            />
          </Fragment>
        )}

        {/* Bouton "Me localiser" */}
        <LocateControl onLocated={setUserPos} />
      </MapContainer>

      {/* Animation spin pour le spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
