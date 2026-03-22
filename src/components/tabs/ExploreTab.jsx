import { useState, useMemo } from 'react'
import { Sparkles, Circle, VolumeX, Coffee, BookOpen, User, ChevronRight, Monitor } from 'lucide-react'
import { isLibOpen } from '../../utils/time'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'

/* ── Palette mat désaturée ────────────────────────────────────── */
const MINT         = '#6BA89A'   // sauge mat — moins brillant
const FOREST_LIGHT = '#4A8C82'   // vert forêt désaturé
const FOREST_DEEP  = '#1C3A2E'  // vert profond mat (flat)
const CREAM        = '#F0EFD8'   // crème chaud mat

const FILTERS = [
  { id: 'all',       key: 'filterAll',       Icon: () => <Sparkles size={13} strokeWidth={2} /> },
  { id: 'open',      key: 'filterOpen',      Icon: () => <Circle   size={8}  fill="#22c55e" stroke="none" /> },
  { id: 'quiet',     key: 'filterQuiet',     Icon: () => <VolumeX  size={13} strokeWidth={2} /> },
  { id: 'cafe',      key: 'filterCafe',      Icon: () => <Coffee   size={13} strokeWidth={2} /> },
  { id: 'workspace', key: 'filterWorkspace', Icon: () => <Monitor  size={13} strokeWidth={2} /> },
  { id: 'library',   key: 'filterLibrary',   Icon: () => <BookOpen size={13} strokeWidth={2} /> },
]

function typeIs(type, ...keywords) {
  const t = (type ?? '').toLowerCase()
  return keywords.some(k => t.includes(k))
}

function getOccupancyMeta(occupancy) {
  if (occupancy >= 80) return { score: 5, color: '#e05252' }
  if (occupancy >= 60) return { score: 4, color: '#e67e22' }
  if (occupancy >= 40) return { score: 3, color: '#d4ac0d' }
  if (occupancy >= 20) return { score: 2, color: FOREST_LIGHT }
  return                       { score: 1, color: FOREST_LIGHT }
}

function OccupancyGauge({ occupancy }) {
  const { score, color } = getOccupancyMeta(occupancy)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <User key={i} size={11} strokeWidth={2.5}
              style={{ color: i <= score ? color : 'rgba(0,0,0,0.12)' }} />
      ))}
      <span className="ml-1 text-[10px] font-bold" style={{ color }}>{score}/5</span>
    </div>
  )
}

function OpenDot({ open, t }) {
  if (open === null) return null
  return (
    <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(21,52,98,0.75)', backdropFilter: 'blur(6px)', color: '#fff' }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: open ? MINT : '#f87171' }} />
      {open ? t('openBadge') : t('closedBadge')}
    </span>
  )
}

function Placeholder({ type, imageUrl }) {
  const isCafe      = typeIs(type, 'caf')
  const isWorkspace = typeIs(type, 'workspace', 'cowork')
  const bg = isCafe      ? `linear-gradient(135deg,#e8e8a0,${CREAM})`
           : isWorkspace ? `linear-gradient(135deg,${MINT}40,${FOREST_LIGHT}30)`
           :               `linear-gradient(135deg,${FOREST_DEEP}15,${FOREST_LIGHT}20)`
  const emoji = isCafe ? '☕' : isWorkspace ? '💻' : '📚'
  return (
    <div className="absolute inset-0 items-center justify-center text-2xl"
         style={{ display: imageUrl ? 'none' : 'flex', background: bg }}>
      {emoji}
    </div>
  )
}

/* ── Carte "nearby" — format portrait ────────────────────────── */
function NearbyCard({ lib, onSelect, t }) {
  const open = isLibOpen(lib.openingTime, lib.closingTime)
  return (
    <button
      onClick={() => onSelect(lib)}
      className="shrink-0 w-44 rounded-2xl overflow-hidden transition-all active:scale-[0.96] text-left"
      style={{
        background: '#fff',
        boxShadow: `0 1px 4px rgba(0,0,0,0.06)`,
        border: `1px solid rgba(0,0,0,0.06)`,
      }}
    >
      <div className="w-full h-28 relative overflow-hidden">
        {lib.imageUrl ? (
          <img src={lib.imageUrl} alt={lib.name} className="w-full h-full object-cover"
               onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
        ) : null}
        <Placeholder type={lib.type} imageUrl={lib.imageUrl} />
        <OpenDot open={open} t={t} />
      </div>
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1.5">
        <p className="font-bold text-sm truncate leading-snug" style={{ color: FOREST_DEEP }}>{lib.name}</p>
        {lib.address && <p className="text-[11px] truncate" style={{ color: '#94a3b8' }}>{lib.address}</p>}
        <OccupancyGauge occupancy={lib.occupancy ?? 50} />
      </div>
    </button>
  )
}

/* ── Carte "trending" — format liste ─────────────────────────── */
function TrendingCard({ lib, onSelect, rank, t }) {
  const isCafe      = typeIs(lib.type, 'caf')
  const isWorkspace = typeIs(lib.type, 'workspace', 'cowork')
  const open = isLibOpen(lib.openingTime, lib.closingTime)
  return (
    <button
      onClick={() => onSelect(lib)}
      className="w-full flex items-center gap-3.5 rounded-2xl p-3.5 transition-all active:scale-[0.98]"
      style={{
        background: '#fff',
        boxShadow: 'none',
        border: `1px solid rgba(0,0,0,0.07)`,
      }}
    >
      {/* Rang */}
      <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
           style={{ background: FOREST_DEEP }}>
        <span className="text-[11px] font-black" style={{ color: MINT }}>#{rank}</span>
      </div>

      {/* Miniature */}
      <div className="w-13 h-13 shrink-0 rounded-xl overflow-hidden relative" style={{ width: 52, height: 52 }}>
        {lib.imageUrl ? (
          <img src={lib.imageUrl} alt={lib.name} className="w-full h-full object-cover"
               onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
        ) : null}
        <div className="absolute inset-0 items-center justify-center text-xl"
             style={{
               display: lib.imageUrl ? 'none' : 'flex',
               background: isCafe      ? `linear-gradient(135deg,${CREAM},#e8e8a0)`
                         : isWorkspace ? `linear-gradient(135deg,${MINT}40,${FOREST_LIGHT}30)`
                         :               `linear-gradient(135deg,${FOREST_DEEP}15,${FOREST_LIGHT}20)`,
             }}>
          {isCafe ? '☕' : isWorkspace ? '💻' : '📚'}
        </div>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0 text-left">
        <p className="font-bold text-sm truncate leading-snug" style={{ color: FOREST_DEEP }}>{lib.name}</p>
        {lib.address && <p className="text-[11px] truncate mt-0.5" style={{ color: '#94a3b8' }}>{lib.address}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          <OccupancyGauge occupancy={lib.occupancy ?? 50} />
          {open !== null && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: open ? MINT : '#f87171' }} />
              <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                {open ? t('open') : t('closed')}
              </span>
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={14} strokeWidth={2.5} style={{ color: `rgba(138,209,194,0.60)` }} className="shrink-0" />
    </button>
  )
}

/* ── Composant principal ──────────────────────────────────────── */
export default function ExploreTab({ libraries, onSelect }) {
  const { user } = useUser()
  const { t }    = useLanguage()
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    return libraries.filter(lib => {
      if (activeFilter === 'open')      return isLibOpen(lib.openingTime, lib.closingTime) === true
      if (activeFilter === 'quiet')     return (lib.vibe ?? '').toLowerCase().includes('silence') || (lib.occupancy ?? 50) < 35
      if (activeFilter === 'cafe')      return typeIs(lib.type, 'caf')
      if (activeFilter === 'workspace') return typeIs(lib.type, 'workspace', 'cowork')
      if (activeFilter === 'library')   return typeIs(lib.type, 'librar', 'biblioth')
      return true
    })
  }, [libraries, activeFilter])

  const nearby   = filtered.slice(0, 8)
  const trending = [...filtered].sort((a, b) => (a.occupancy ?? 50) - (b.occupancy ?? 50)).slice(0, 5)

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: '#F5F5F0', scrollbarWidth: 'none' }}>

      {/* ══ Hero Header — aplat vert profond mat ═════════════════════ */}
      <div style={{
        background: FOREST_DEEP,           /* aplat plein, zéro dégradé */
        paddingTop: 56,
        paddingBottom: 72,
        paddingLeft: 22,
        paddingRight: 22,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Unique cercle très discret — quasi invisible */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: `rgba(107,168,154,0.06)`,
          pointerEvents: 'none',
        }} />

        {/* Salutation */}
        <p className="text-xs font-medium tracking-widest uppercase mb-2"
           style={{ color: `rgba(107,168,154,0.70)`, letterSpacing: '0.12em' }}>
          {t('greeting', user.name).split(',')[0]}
        </p>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          fontSize: '26px', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.15,
          color: CREAM, marginBottom: 6,
        }}>
          {t('findYourSpot') || 'Find your spot.'}
        </h1>
        <p className="text-xs font-medium" style={{ color: `rgba(240,239,216,0.45)` }}>
          {t('places', filtered.length)}
        </p>
      </div>

      {/* ══ Filtres — chevauchent le header ══════════════════════════ */}
      <div style={{ marginTop: -38, paddingBottom: 8 }}>
        <div className="flex gap-2 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(({ id, key, Icon }) => {
            const isActive = activeFilter === id
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full
                           text-xs font-semibold transition-all duration-150 active:scale-95"
                style={isActive ? {
                  background: FOREST_DEEP,
                  color: MINT,
                  boxShadow: `0 4px 14px rgba(21,52,98,0.30)`,
                  border: '1px solid transparent',
                } : {
                  background: '#fff',
                  color: '#64748b',
                  border: `1px solid rgba(79,160,149,0.18)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ color: isActive ? MINT : FOREST_LIGHT, display: 'flex', alignItems: 'center' }}>
                  <Icon />
                </span>
                {t(key)}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: `rgba(138,209,194,0.15)`, border: `1px solid rgba(138,209,194,0.30)` }}>
            <Sparkles size={24} style={{ color: FOREST_LIGHT }} />
          </div>
          <p className="font-bold" style={{ color: FOREST_DEEP }}>{t('noPlaces')}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{t('tryFilter')}</p>
        </div>
      ) : (
        <>
          {/* À proximité */}
          <div className="mt-3 mb-6">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: FOREST_LIGHT }}>{t('nearby')}</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
              {nearby.map(lib => <NearbyCard key={lib.id} lib={lib} onSelect={onSelect} t={t} />)}
            </div>
          </div>

          {/* Les plus disponibles */}
          <div className="px-5 pb-28">
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-3"
                style={{ color: FOREST_LIGHT }}>{t('mostAvailable')}</h2>
            <div className="space-y-2.5">
              {trending.map((lib, i) => <TrendingCard key={lib.id} lib={lib} onSelect={onSelect} rank={i+1} t={t} />)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
