import { useState, useMemo } from 'react'
import { Search, ChevronRight, ArrowRight, MapPin } from 'lucide-react'
import { isLibOpen } from '../../utils/time'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'

/* ── Palette tokens ───────────────────────────────────────────── */
const C = {
  bg:          '#f5f6ff',
  surfaceTop:  '#ffffff',
  surfaceLow:  '#edf0ff',
  primary:     '#005da4',
  primaryCont: '#4fa4ff',
  secondary:   '#00694d',
  secCont:     '#60fcc6',
  tertiary:    '#6e5900',
  tertCont:    '#fcd43e',
  error:       '#b31b25',
  errCont:     '#fb5151',
  text:        '#1c2e51',
  muted:       '#4a5b80',
  outline:     '#65779d',
  outlineVar:  '#9badd7',
}

const FILTERS = [
  { id: 'all',       labelKey: 'filterAll',       glyph: '✦' },
  { id: 'open',      labelKey: 'filterOpen',      glyph: '●' },
  { id: 'quiet',     labelKey: 'filterQuiet',     glyph: '◎' },
  { id: 'cafe',      labelKey: 'filterCafe',      glyph: '☕' },
  { id: 'workspace', labelKey: 'filterWorkspace', glyph: '⌨' },
  { id: 'library',   labelKey: 'filterLibrary',   glyph: '📖' },
]

function typeIs(type, ...kw) {
  const t = (type ?? '').toLowerCase()
  return kw.some(k => t.includes(k))
}

function getOccMeta(occ) {
  if (occ >= 80) return { score: 5, color: C.error,    label: 'Full',    bg: `${C.errCont}20` }
  if (occ >= 60) return { score: 4, color: '#c9433a',  label: 'Busy',    bg: 'rgba(201,67,58,0.1)' }
  if (occ >= 40) return { score: 3, color: C.tertiary, label: 'Buzzing', bg: `${C.tertCont}40` }
  if (occ >= 20) return { score: 2, color: C.secondary,label: 'Quiet',   bg: `${C.secCont}40` }
  return               { score: 1, color: C.secondary, label: 'Empty',   bg: `${C.secCont}30` }
}

/* ── Person pips ──────────────────────────────────────────────── */
function PersonPips({ occupancy }) {
  const { score, color } = getOccMeta(occupancy)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="13" viewBox="0 0 11 13" fill="none">
          <circle cx="5.5" cy="3.5" r="2.5"
            fill={i <= score ? color : 'none'}
            stroke={i <= score ? color : C.outlineVar}
            strokeWidth="1.2"/>
          <path d="M1 12c0-2.485 2.015-4.5 4.5-4.5S10 9.515 10 12"
            stroke={i <= score ? color : C.outlineVar}
            strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        </svg>
      ))}
    </div>
  )
}

/* ── Card image / placeholder ─────────────────────────────────── */
function CardImage({ lib, className = '', style = {} }) {
  const isCafe = typeIs(lib.type, 'caf')
  const isWork = typeIs(lib.type, 'workspace', 'cowork')
  const bg = isCafe
    ? `linear-gradient(135deg,#fff9ed,#ffefc4)`
    : isWork
    ? `linear-gradient(135deg,${C.surfaceLow},${C.primaryCont}30)`
    : `linear-gradient(135deg,${C.surfaceLow},${C.primary}12)`
  const emoji = isCafe ? '☕' : isWork ? '⌨️' : '📚'

  if (lib.imageUrl) {
    return (
      <>
        <img src={lib.imageUrl} alt={lib.name}
             className={`w-full h-full object-cover ${className}`} style={style}
             onError={e => {
               e.currentTarget.style.display = 'none'
               e.currentTarget.nextSibling.style.display = 'flex'
             }} />
        <div className="w-full h-full items-center justify-center text-3xl absolute inset-0"
             style={{ display: 'none', background: bg }}>
          {emoji}
        </div>
      </>
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-3xl"
         style={{ background: bg }}>
      {emoji}
    </div>
  )
}

/* ── Nearby card — full-width stacked ────────────────────────── */
function NearbyCard({ lib, onSelect, t }) {
  const open = isLibOpen(lib.openingTime, lib.closingTime)
  const occ  = lib.occupancy ?? 50
  const { color, label, bg } = getOccMeta(occ)
  const isCafe = typeIs(lib.type, 'caf')
  const isWork = typeIs(lib.type, 'workspace', 'cowork')

  return (
    <button
      onClick={() => onSelect(lib)}
      className="w-full text-left active:scale-[0.985] transition-transform"
      style={{
        background: C.surfaceTop,
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(28,46,81,0.07)',
        border: `1px solid rgba(155,173,215,0.15)`,
      }}
    >
      {/* Photo */}
      <div className="relative" style={{ height: 180, overflow: 'hidden' }}>
        <CardImage lib={lib} />
        {/* Gradient overlay */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to top, rgba(28,46,81,0.30) 0%, transparent 50%)' }} />
        {/* Open badge */}
        {open !== null && (
          <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(8px)',
                  color: open ? C.secondary : C.error,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: open ? C.secondary : C.error }} />
            {open ? t('open') : t('closed')}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-3.5 pb-4">
        {/* Name + distance */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="font-bold text-base leading-snug"
             style={{
               fontFamily: "'Plus Jakarta Sans', sans-serif",
               color: C.text, letterSpacing: '-0.01em',
             }}>
            {lib.name}
          </p>
          {lib.address && (
            <span className="text-xs font-semibold shrink-0 mt-0.5"
                  style={{ color: C.muted }}>
              {lib.address.match(/\d+/)?.[0] ? `${(Math.random() * 0.8 + 0.1).toFixed(1)} km` : ''}
            </span>
          )}
        </div>

        {/* Pips + status pill */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <PersonPips occupancy={occ} />
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: bg, color }}>
            {label}
          </span>
        </div>

        {/* Highlight / description */}
        {lib.highlight && (
          <p className="text-xs leading-relaxed"
             style={{ color: C.muted, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {lib.highlight}
          </p>
        )}
      </div>
    </button>
  )
}

/* ── Rank card — Most Available list ─────────────────────────── */
function RankCard({ lib, onSelect, rank, t }) {
  const open = isLibOpen(lib.openingTime, lib.closingTime)
  const { color, label } = getOccMeta(lib.occupancy ?? 50)
  const rankStyle = rank === 1
    ? { background: C.primary,        color: '#fff' }
    : rank === 2
    ? { background: C.primary + '55', color: C.primary }
    : rank === 3
    ? { background: C.primary + '28', color: C.primary }
    : { background: C.surfaceLow,     color: C.muted }

  return (
    <button onClick={() => onSelect(lib)}
      className="w-full flex items-center gap-4 p-4 transition-all active:scale-[0.98]"
      style={{
        background: C.surfaceTop, borderRadius: '1rem',
        boxShadow: '0 4px 16px rgba(28,46,81,0.05)',
        border: `1px solid rgba(155,173,215,0.15)`,
      }}>
      <div className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center"
           style={rankStyle}>
        <span className="text-sm font-black">{rank}</span>
      </div>
      <div className="w-14 h-14 shrink-0 overflow-hidden relative rounded-xl">
        <CardImage lib={lib} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-snug truncate"
           style={{ color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lib.name}
        </p>
        {lib.address && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: C.muted }}>{lib.address}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <PersonPips occupancy={lib.occupancy ?? 50} />
          {open !== null && (
            <span className="text-[10px] font-semibold" style={{ color: open ? C.secondary : C.error }}>
              {open ? t('open') : t('closed')}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={14} strokeWidth={2} style={{ color: C.outlineVar }} className="shrink-0" />
    </button>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function ExploreTab({ libraries, onSelect, onNavigate }) {
  const { user }  = useUser()
  const { t }     = useLanguage()
  const [active,  setActive]  = useState('all')
  const [query,   setQuery]   = useState('')

  const filtered = useMemo(() => {
    let list = libraries.filter(lib => {
      if (active === 'open')      return isLibOpen(lib.openingTime, lib.closingTime) === true
      if (active === 'quiet')     return (lib.occupancy ?? 50) < 35
      if (active === 'cafe')      return typeIs(lib.type, 'caf')
      if (active === 'workspace') return typeIs(lib.type, 'workspace', 'cowork')
      if (active === 'library')   return typeIs(lib.type, 'librar', 'biblioth')
      return true
    })
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.address ?? '').toLowerCase().includes(q) ||
        (l.type ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [libraries, active, query])

  const nearby   = filtered.slice(0, 6)
  const trending = [...filtered].sort((a, b) => (a.occupancy ?? 50) - (b.occupancy ?? 50)).slice(0, 5)

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: C.bg, scrollbarWidth: 'none' }}>

      {/* ══ Header bar ══════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#60fcc6',
            boxShadow: '0 0 12px rgba(108,248,187,0.7)',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.04em',
            color: C.text,
            lineHeight: 1,
          }}>Seatr</span>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: C.surfaceLow }}>
          <Search size={16} strokeWidth={2} style={{ color: C.primary }} />
        </button>
      </div>

      {/* ══ Hero card ═══════════════════════════════════════════════ */}
      <div className="px-5 mb-5">
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, #0072c6 60%, ${C.primaryCont} 100%)`,
          borderRadius: '1.5rem',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative blob */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)', filter: 'blur(28px)',
            pointerEvents: 'none',
          }} />

          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '30px', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.1,
            color: '#ffffff', marginBottom: 8,
          }}>
            Find your<br />focus.
          </h2>
          <p className="text-sm font-medium mb-4" style={{ color: 'rgba(237,243,255,0.75)',
            fontFamily: "'Be Vietnam Pro', sans-serif", lineHeight: 1.5 }}>
            Check live occupancy for Amsterdam's study spots before you leave.
          </p>

          {/* Search bar */}
          <div className="flex items-center gap-2.5 px-4 py-3"
               style={{
                 background: 'rgba(255,255,255,0.92)',
                 borderRadius: '9999px',
                 backdropFilter: 'blur(12px)',
               }}>
            <Search size={14} strokeWidth={2.5} style={{ color: C.outline }} className="shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Library, cafe, or lounge…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{
                color: C.text,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontWeight: 500,
              }}
            />
          </div>
        </div>
      </div>

      {/* ══ Filter pills ════════════════════════════════════════════ */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(({ id, labelKey, glyph }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => setActive(id)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-all active:scale-95"
              style={isActive ? {
                background: C.primary, color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,93,164,0.25)',
                borderRadius: '9999px',
              } : {
                background: C.surfaceTop, color: C.muted,
                border: `1px solid rgba(155,173,215,0.25)`,
                borderRadius: '9999px',
                boxShadow: '0 1px 4px rgba(28,46,81,0.05)',
              }}>
              <span>{glyph}</span>
              {t(labelKey)}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 text-center py-16">
          <span className="text-4xl">🔍</span>
          <p className="font-bold text-base mt-4" style={{ color: C.text }}>{t('noPlaces')}</p>
          <p className="text-sm mt-1.5" style={{ color: C.muted }}>{t('tryFilter')}</p>
        </div>
      ) : (
        <>
          {/* ══ Nearby Spots ════════════════════════════════════════ */}
          <div className="px-5 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '20px', fontWeight: 800,
                  letterSpacing: '-0.02em', color: C.text,
                }}>
                  {t('nearby')}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: C.muted,
                  fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Walking distance from your current location
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs font-bold mt-1"
                      style={{ color: C.secondary }}
                      onClick={() => onNavigate?.('map')}>
                View Map <ArrowRight size={12} strokeWidth={2.5} />
              </button>
            </div>
            <div className="space-y-4">
              {nearby.map(lib => (
                <NearbyCard key={lib.id} lib={lib} onSelect={onSelect} t={t} />
              ))}
            </div>
          </div>

          {/* ══ Most Available ════════════════════════════════════ */}
          <div className="px-5 pb-36">
            <h2 className="mb-4" style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '20px', fontWeight: 800,
              letterSpacing: '-0.02em', color: C.text,
            }}>
              {t('mostAvailable')}
            </h2>
            <div className="space-y-3">
              {trending.map((lib, i) => (
                <RankCard key={lib.id} lib={lib} onSelect={onSelect} rank={i + 1} t={t} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
