import { useState, useMemo } from 'react'
import { Sparkles, Circle, VolumeX, Coffee, BookOpen, User, ChevronRight, Monitor } from 'lucide-react'
import { isLibOpen } from '../../utils/time'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'

/* ── Palette ──────────────────────────────────────────────────── */
const MINT         = '#8AD1C2'
const FOREST_LIGHT = '#4FA095'
const FOREST_DEEP  = '#153462'
const CREAM        = '#F6F6C9'

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
  if (occupancy >= 80) return { score: 5, color: '#c0392b', bg: '#fef2f2' }
  if (occupancy >= 60) return { score: 4, color: '#e67e22', bg: '#fff7ed' }
  if (occupancy >= 40) return { score: 3, color: '#d4ac0d', bg: '#fefce8' }
  if (occupancy >= 20) return { score: 2, color: '#27ae60', bg: '#f0fdf4' }
  return                       { score: 1, color: '#27ae60', bg: '#f0fdf4' }
}

function OccupancyGauge({ occupancy }) {
  const { score, color } = getOccupancyMeta(occupancy)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <User key={i} size={12} strokeWidth={2.5}
              style={{ color: i <= score ? color : '#d1d5db' }} />
      ))}
      <span className="ml-1 text-[11px] font-semibold" style={{ color }}>
        {score}/5
      </span>
    </div>
  )
}

function OpenDot({ open, t }) {
  if (open === null) return null
  return (
    <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: 'rgba(21,52,98,0.70)', backdropFilter: 'blur(6px)', color: '#fff' }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: open ? MINT : '#f87171' }} />
      {open ? t('openBadge') : t('closedBadge')}
    </span>
  )
}

function Placeholder({ type, imageUrl }) {
  const isCafe      = typeIs(type, 'caf')
  const isWorkspace = typeIs(type, 'workspace', 'cowork')
  const bg = isCafe      ? `linear-gradient(135deg,${CREAM},#e8e8a0)`
           : isWorkspace ? `linear-gradient(135deg,rgba(138,209,194,0.25),rgba(79,160,149,0.20))`
           :               `linear-gradient(135deg,rgba(21,52,98,0.08),rgba(79,160,149,0.12))`
  const emoji = isCafe ? '☕' : isWorkspace ? '💻' : '📚'
  return (
    <div className="absolute inset-0 items-center justify-center text-2xl"
         style={{ display: imageUrl ? 'none' : 'flex', background: bg }}>
      {emoji}
    </div>
  )
}

function NearbyCard({ lib, onSelect, t }) {
  const open = isLibOpen(lib.openingTime, lib.closingTime)
  return (
    <button
      onClick={() => onSelect(lib)}
      className="shrink-0 w-44 rounded-2xl overflow-hidden transition-transform active:scale-[0.97] text-left"
      style={{
        background: '#fff',
        border: `1px solid rgba(79,160,149,0.18)`,
        boxShadow: `0 2px 12px rgba(21,52,98,0.07), 0 1px 3px rgba(0,0,0,0.04)`,
      }}
    >
      <div className="w-full h-28 relative overflow-hidden">
        {lib.imageUrl ? (
          <img src={lib.imageUrl} alt={lib.name} className="w-full h-full object-cover"
               onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
        ) : null}
        <Placeholder type={lib.type} imageUrl={lib.imageUrl} />
        <OpenDot open={open} t={t} />
      </div>
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1">
        <p className="font-semibold text-sm truncate leading-snug" style={{ color: FOREST_DEEP }}>{lib.name}</p>
        {lib.address && <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{lib.address}</p>}
        <div className="mt-1"><OccupancyGauge occupancy={lib.occupancy ?? 50} /></div>
      </div>
    </button>
  )
}

function TrendingCard({ lib, onSelect, rank, t }) {
  const isCafe      = typeIs(lib.type, 'caf')
  const isWorkspace = typeIs(lib.type, 'workspace', 'cowork')
  const open = isLibOpen(lib.openingTime, lib.closingTime)
  return (
    <button
      onClick={() => onSelect(lib)}
      className="w-full flex items-center gap-3 rounded-2xl p-3 transition-transform active:scale-[0.98]"
      style={{
        background: '#fff',
        border: `1px solid rgba(79,160,149,0.15)`,
        boxShadow: `0 2px 12px rgba(21,52,98,0.06), 0 1px 3px rgba(0,0,0,0.03)`,
      }}
    >
      {/* Rang */}
      <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center"
           style={{ background: `rgba(138,209,194,0.15)`, border: `1px solid rgba(138,209,194,0.30)` }}>
        <span className="text-[11px] font-bold" style={{ color: FOREST_LIGHT }}>#{rank}</span>
      </div>

      {/* Miniature */}
      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden relative">
        {lib.imageUrl ? (
          <img src={lib.imageUrl} alt={lib.name} className="w-full h-full object-cover"
               onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
        ) : null}
        <div className="absolute inset-0 items-center justify-center text-lg"
             style={{
               display: lib.imageUrl ? 'none' : 'flex',
               background: isCafe      ? `linear-gradient(135deg,${CREAM},#e8e8a0)`
                         : isWorkspace ? `linear-gradient(135deg,rgba(138,209,194,0.25),rgba(79,160,149,0.20))`
                         :               `linear-gradient(135deg,rgba(21,52,98,0.08),rgba(79,160,149,0.12))`,
             }}>
          {isCafe ? '☕' : isWorkspace ? '💻' : '📚'}
        </div>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-base truncate leading-snug" style={{ color: FOREST_DEEP }}>{lib.name}</p>
        {lib.address && <p className="text-xs truncate mt-0.5" style={{ color: '#94a3b8' }}>{lib.address}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          <OccupancyGauge occupancy={lib.occupancy ?? 50} />
          {open !== null && (
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: open ? MINT : '#f87171' }} />
              <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                {open ? t('open') : t('closed')}
              </span>
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={14} strokeWidth={2} style={{ color: `rgba(79,160,149,0.45)` }} className="shrink-0" />
    </button>
  )
}

export default function ExploreTab({ libraries, onSelect }) {
  const { user } = useUser()
  const { t } = useLanguage()
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
    <div className="absolute inset-0 overflow-y-auto" style={{ background: '#f2f6f5', scrollbarWidth: 'none' }}>

      {/* Header */}
      <div className="px-5 pt-16 pb-5">
        <h1 className="text-[28px] font-extrabold tracking-tighter leading-tight"
            style={{ color: FOREST_DEEP }}>
          {t('greeting', user.name)}
        </h1>
      </div>

      {/* Filtres */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(({ id, key, Icon }) => {
            const isActive = activeFilter === id
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                           text-xs font-medium transition-all duration-150 active:scale-95"
                style={isActive ? {
                  background: FOREST_DEEP,
                  color: MINT,
                  border: '1px solid transparent',
                  boxShadow: `0 2px 8px rgba(21,52,98,0.22)`,
                } : {
                  background: '#fff',
                  color: '#64748b',
                  border: `1px solid rgba(79,160,149,0.20)`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <span style={{ color: isActive ? MINT : '#64748b', display: 'flex', alignItems: 'center' }}>
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
          <p className="font-semibold" style={{ color: FOREST_DEEP }}>{t('noPlaces')}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{t('tryFilter')}</p>
        </div>
      ) : (
        <>
          {/* À proximité */}
          <div className="mb-7">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: FOREST_LIGHT }}>{t('nearby')}</h2>
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{t('places', filtered.length)}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
              {nearby.map(lib => <NearbyCard key={lib.id} lib={lib} onSelect={onSelect} t={t} />)}
            </div>
          </div>

          {/* Les plus disponibles */}
          <div className="px-5 pb-36">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: FOREST_LIGHT }}>{t('mostAvailable')}</h2>
            <div className="space-y-2.5">
              {trending.map((lib, i) => <TrendingCard key={lib.id} lib={lib} onSelect={onSelect} rank={i + 1} t={t} />)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
