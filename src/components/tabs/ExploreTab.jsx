import { useState, useMemo } from 'react'
import { Sparkles, Circle, VolumeX, Coffee, BookOpen, User, ChevronRight } from 'lucide-react'
import { isLibOpen } from '../../utils/time'
import { useUser } from '../../context/UserContext'

/* ── Filtres avec icônes Lucide ────────────────────────────────── */
const FILTERS = [
  { id: 'all',    label: 'Tous',        Icon: () => <Sparkles size={13} strokeWidth={2} /> },
  { id: 'open',   label: 'Ouvert',      Icon: () => <Circle   size={8}  fill="#22c55e" stroke="none" /> },
  { id: 'quiet',  label: 'Calme',       Icon: () => <VolumeX  size={13} strokeWidth={2} /> },
  { id: 'cafe',   label: 'Café',        Icon: () => <Coffee   size={13} strokeWidth={2} /> },
  { id: 'library', label: 'Librairie',  Icon: () => <BookOpen size={13} strokeWidth={2} /> },
]

/* ── Couleurs sémantiques par niveau ───────────────────────────── */
function getOccupancyMeta(occupancy) {
  if (occupancy >= 80) return { score: 5, color: '#c0392b', bg: '#fef2f2' } // rouge brique
  if (occupancy >= 60) return { score: 4, color: '#e67e22', bg: '#fff7ed' } // orange
  if (occupancy >= 40) return { score: 3, color: '#d4ac0d', bg: '#fefce8' } // moutarde
  if (occupancy >= 20) return { score: 2, color: '#27ae60', bg: '#f0fdf4' } // vert pastel
  return                       { score: 1, color: '#27ae60', bg: '#f0fdf4' } // vert calme
}

/* ── Jauge de 5 icônes User ────────────────────────────────────── */
function OccupancyGauge({ occupancy }) {
  const { score, color } = getOccupancyMeta(occupancy)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <User
          key={i}
          size={12}
          strokeWidth={2.5}
          style={{ color: i <= score ? color : '#d1d5db' }}
        />
      ))}
      <span className="ml-1 text-[11px] font-semibold" style={{ color }}>
        {score}/5
      </span>
    </div>
  )
}

/* ── Pastille Ouvert/Fermé sur l'image ─────────────────────────── */
function OpenDot({ open }) {
  if (open === null) return null
  return (
    <span
      className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: open ? '#4ade80' : '#f87171' }}
      />
      {open ? 'Open' : 'Closed'}
    </span>
  )
}

/* ── Placeholder image (caché si imageUrl existe) ──────────────── */
function Placeholder({ type, imageUrl }) {
  const isCafe = type === 'Café'
  return (
    <div
      className="absolute inset-0 items-center justify-center text-2xl"
      style={{
        display: imageUrl ? 'none' : 'flex',
        background: isCafe
          ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
          : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
      }}
    >
      {isCafe ? '☕' : '📚'}
    </div>
  )
}

/* ── Carte "À proximité" (format portrait) ────────────────────── */
function NearbyCard({ lib, onSelect }) {
  const open = isLibOpen(lib.openingTime, lib.closingTime)

  return (
    <button
      onClick={() => onSelect(lib)}
      className="shrink-0 w-44 rounded-2xl overflow-hidden bg-white
                 transition-transform active:scale-[0.97] text-left"
      style={{
        border: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image */}
      <div className="w-full h-28 relative overflow-hidden">
        {lib.imageUrl ? (
          <img
            src={lib.imageUrl} alt={lib.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <Placeholder type={lib.type} imageUrl={lib.imageUrl} />
        <OpenDot open={open} />
      </div>

      {/* Info */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1">
        <p className="font-semibold text-slate-800 text-sm truncate leading-snug">
          {lib.name}
        </p>
        {lib.address && (
          <p className="text-xs text-slate-400 truncate">{lib.address}</p>
        )}
        <div className="mt-1">
          <OccupancyGauge occupancy={lib.occupancy ?? 50} />
        </div>
      </div>
    </button>
  )
}

/* ── Carte "Les plus disponibles" (format liste) ──────────────── */
function TrendingCard({ lib, onSelect, rank }) {
  const isCafe = lib.type === 'Café'
  const open   = isLibOpen(lib.openingTime, lib.closingTime)

  return (
    <button
      onClick={() => onSelect(lib)}
      className="w-full flex items-center gap-3 bg-white rounded-2xl p-3
                 transition-transform active:scale-[0.98]"
      style={{
        border: '1px solid rgba(226,232,240,0.7)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Rang */}
      <div className="w-7 h-7 shrink-0 rounded-full bg-slate-50 border border-slate-100
                      flex items-center justify-center">
        <span className="text-[11px] font-bold text-slate-400">#{rank}</span>
      </div>

      {/* Miniature */}
      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden relative">
        {lib.imageUrl ? (
          <img
            src={lib.imageUrl} alt={lib.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 items-center justify-center text-lg"
          style={{
            display: lib.imageUrl ? 'none' : 'flex',
            background: isCafe
              ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
              : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
          }}
        >
          {isCafe ? '☕' : '📚'}
        </div>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-slate-800 text-base truncate leading-snug">{lib.name}</p>
        {lib.address && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{lib.address}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <OccupancyGauge occupancy={lib.occupancy ?? 50} />
          {open !== null && (
            <span className="flex items-center gap-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: open ? '#4ade80' : '#f87171' }}
              />
              <span className="text-[11px] font-medium text-slate-400">
                {open ? 'Ouvert' : 'Fermé'}
              </span>
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={14} strokeWidth={2} className="shrink-0 text-slate-300" />
    </button>
  )
}

/* ── Composant principal ───────────────────────────────────────── */
export default function ExploreTab({ libraries, onSelect }) {
  const { user } = useUser()
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    return libraries.filter(lib => {
      if (activeFilter === 'open')
        return isLibOpen(lib.openingTime, lib.closingTime) === true
      if (activeFilter === 'quiet')
        return (lib.vibe ?? '').toLowerCase().includes('silence') || (lib.occupancy ?? 50) < 35
      if (activeFilter === 'cafe')
        return lib.type === 'Café'
      if (activeFilter === 'library')
        return (lib.type ?? '').toLowerCase().includes('librar') ||
               (lib.type ?? '').toLowerCase().includes('biblioth')
      return true
    })
  }, [libraries, activeFilter])

  const nearby   = filtered.slice(0, 8)
  const trending = [...filtered]
    .sort((a, b) => (a.occupancy ?? 50) - (b.occupancy ?? 50))
    .slice(0, 5)

  return (
    <div className="absolute inset-0 overflow-y-auto bg-slate-50" style={{ scrollbarWidth: 'none' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-5 pt-16 pb-5">
        <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tighter leading-tight">
          Salut, {user.name}&nbsp;!
        </h1>
      </div>

      {/* ── Filtres rapides ─────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(({ id, label, Icon }) => {
            const isActive = activeFilter === id
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                           text-xs font-medium transition-all duration-150 active:scale-95"
                style={isActive ? {
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid transparent',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
                } : {
                  background: '#fff',
                  color: '#475569',
                  border: '1px solid rgba(226,232,240,0.9)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ color: isActive ? '#fff' : '#64748b', display: 'flex', alignItems: 'center' }}>
                  <Icon />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">Aucun lieu pour ce filtre</p>
          <p className="text-xs text-slate-400 mt-1">Essaie un autre filtre ci-dessus</p>
        </div>
      ) : (
        <>
          {/* ── À proximité ────────────────────────────────────── */}
          <div className="mb-7">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                À proximité
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {filtered.length} lieu{filtered.length > 1 ? 'x' : ''}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
              {nearby.map(lib => (
                <NearbyCard key={lib.id} lib={lib} onSelect={onSelect} />
              ))}
            </div>
          </div>

          {/* ── Les plus disponibles ────────────────────────────── */}
          <div className="px-5 pb-36">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Les plus disponibles
            </h2>
            <div className="space-y-2.5">
              {trending.map((lib, i) => (
                <TrendingCard key={lib.id} lib={lib} onSelect={onSelect} rank={i + 1} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
