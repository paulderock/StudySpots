import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { isLibOpen } from '../utils/time'

const AMSTERDAM    = [52.3676, 4.9041]
const DEFAULT_ZOOM = 13
const STALE_MS     = 5 * 60 * 60 * 1000

/* ── Couleurs sémantiques Uber Eats ──────────────────────────────── */
function getOccupancyColor(occupancy, inactive) {
  if (inactive) return '#c0c8d4'
  if (occupancy >= 80) return '#ef4444'  // rouge — très chargé
  if (occupancy >= 60) return '#f97316'  // orange — chargé
  if (occupancy >= 40) return '#eab308'  // moutarde — modéré
  return '#22c55e'                        // vert — calme
}

function isStale(lastUpdated) {
  if (!lastUpdated) return true
  return Date.now() - new Date(lastUpdated).getTime() > STALE_MS
}

/* ── Génère un DivIcon "photo circulaire" avec label flottant ────── */
function createMarkerIcon({ color, imageUrl, type, name = '', isSelected = false, showLabel = false }) {
  const size      = 34
  const half      = size / 2
  const border    = isSelected ? 3 : 2
  const shadow    = isSelected
    ? `0 4px 14px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)`
    : `0 3px 10px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)`
  const innerSize = size - border * 2 - 2

  const isCafe = (type ?? '').toLowerCase().includes('caf')
  const fallbackBg = isCafe
    ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
    : 'linear-gradient(135deg,#eff6ff,#dbeafe)'
  const fallbackEmoji = isCafe ? '☕' : '📚'

  const inner = imageUrl
    ? `<img src="${imageUrl}" style="width:${innerSize}px;height:${innerSize}px;border-radius:50%;object-fit:cover;display:block;" />`
    : `<div style="width:${innerSize}px;height:${innerSize}px;border-radius:50%;background:${fallbackBg};display:flex;align-items:center;justify-content:center;font-size:${Math.round(innerSize * 0.45)}px;line-height:1;">${fallbackEmoji}</div>`

  // Label flottant (visible uniquement si showLabel)
  const labelHtml = showLabel
    ? `<div style="
        position:absolute;
        top:${size + 5}px;
        left:50%;
        transform:translateX(-50%);
        background:rgba(255,255,255,0.55);
        backdrop-filter:blur(8px);
        -webkit-backdrop-filter:blur(8px);
        border-radius:999px;
        padding:1px 6px;
        font-size:9px;
        font-weight:500;
        color:#334155;
        white-space:nowrap;
        box-shadow:0 1px 6px rgba(0,0,0,0.10);
        animation:labelPop 0.22s cubic-bezier(0.34,1.56,0.64,1);
        pointer-events:none;
      ">${name}</div>`
    : ''

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;overflow:visible;cursor:pointer;">
      <div style="
        width:${size}px;height:${size}px;
        border-radius:50%;
        border:${border}px solid ${color};
        box-shadow:${shadow};
        display:flex;align-items:center;justify-content:center;
        background:white;
        box-sizing:border-box;
      ">${inner}</div>
      ${labelHtml}
    </div>`

  return L.divIcon({
    html,
    iconSize:   [size, size],
    iconAnchor: [half, half],
    className:  '',
  })
}

/* ── Traque le niveau de zoom ────────────────────────────────────── */
function ZoomTracker({ onZoom }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) })
  return null
}

/* ── Icône position utilisateur (point bleu pulsant) ─────────────── */
const USER_ICON = L.divIcon({
  html: `<div style="
    width:18px;height:18px;background:#3b82f6;
    border-radius:50%;border:2.5px solid white;
    box-shadow:0 0 0 5px rgba(59,130,246,0.2);
  "></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
  className:  '',
})

/* ── Fly to controller ───────────────────────────────────────────── */
function FlyToController({ focusPoint }) {
  const map = useMap()
  useEffect(() => {
    if (!focusPoint) return
    map.flyTo([focusPoint.lat, focusPoint.lng], 16, { duration: 1.0, easeLinearity: 0.4 })
  }, [focusPoint])
  return null
}

/* ── Bouton "Me localiser" ───────────────────────────────────────── */
function LocateControl({ onLocated }) {
  const map = useMap()
  const [state, setState] = useState('idle')

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
      () => { setState('error'); setTimeout(() => setState('idle'), 3000) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [map, onLocated])

  return (
    <div style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 1000 }}>
      <button
        onClick={handleClick}
        title="Me localiser"
        style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: state === 'error' ? '#ef4444' : 'white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          cursor: state === 'loading' ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {state === 'loading' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"
               style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : state === 'error' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
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
export default function Map({ libraries = [], onSelect, focusPoint, selectedLibId }) {
  const [userPos,    setUserPos]    = useState(null)
  const [zoom,       setZoom]       = useState(DEFAULT_ZOOM)
  const showLabels = zoom >= 14  // labels visibles à partir du zoom 14

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <MapContainer
        center={AMSTERDAM}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="w-full h-full"
      >
        {/* Fond de carte Jawg Streets — eau bleue, parcs verts, routes blanches */}
        <TileLayer
          attribution='<a href="https://www.jawg.io" target="_blank">&copy; Jawg Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={`https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${import.meta.env.VITE_JAWG_TOKEN}`}
          maxZoom={22}
        />

        <ZoomTracker onZoom={setZoom} />

        {/* Marqueurs bibliothèques — photo circulaire + label flottant */}
        {libraries.map((lib) => {
          const stale      = isStale(lib.lastUpdated)
          const open       = isLibOpen(lib.openingTime, lib.closingTime)
          const inactive   = stale || open === false
          const color      = getOccupancyColor(lib.occupancy ?? 50, inactive)
          const isSelected = lib.id === selectedLibId

          return (
            <Marker
              key={lib.id}
              position={[lib.lat, lib.lng]}
              icon={createMarkerIcon({
                color,
                imageUrl:  lib.imageUrl,
                type:      lib.type,
                name:      lib.name,
                isSelected,
                showLabel: showLabels,
              })}
              eventHandlers={{ click: () => onSelect?.(lib) }}
              zIndexOffset={isSelected ? 1000 : 0}
            />
          )
        })}

        {/* Point bleu position utilisateur */}
        {userPos && (
          <Marker position={userPos} icon={USER_ICON} />
        )}

        <FlyToController focusPoint={focusPoint} />
        <LocateControl onLocated={setUserPos} />
      </MapContainer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes labelPop {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.7); }
          60%  { transform: translateX(-50%) scale(1.05); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        .leaflet-container { background: #f0f4f8; }
        .leaflet-marker-icon { overflow: visible !important; }
      `}</style>
    </div>
  )
}
