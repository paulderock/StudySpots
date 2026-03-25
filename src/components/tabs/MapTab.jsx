import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Wifi, Users } from 'lucide-react'
import Map from '../Map'
import { isLibOpen } from '../../utils/time'
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
  text:        '#1c2e51',
  muted:       '#4a5b80',
  outline:     '#65779d',
  outlineVar:  '#9badd7',
}

const SHEET_H = 580
const PEEK_H  = 200
const PEEK_Y  = SHEET_H - PEEK_H

/* ── Occupancy helpers ────────────────────────────────────────── */
function getOccMeta(occ) {
  if (occ >= 80) return { score: 5, color: C.error,    label: 'Full',     textColor: C.error }
  if (occ >= 60) return { score: 4, color: '#c9433a',  label: 'Busy',     textColor: '#c9433a' }
  if (occ >= 40) return { score: 3, color: C.tertiary, label: 'Buzzing',  textColor: C.tertiary }
  if (occ >= 20) return { score: 2, color: C.secondary,label: 'Quiet',    textColor: C.secondary }
  return               { score: 1, color: C.secondary, label: 'Very quiet',textColor: C.secondary }
}

/* ── Person pips SVG ──────────────────────────────────────────── */
function PersonPips({ occupancy }) {
  const { score, color } = getOccMeta(occupancy)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="16" viewBox="0 0 14 16" fill="none">
          <circle cx="7" cy="4" r="3"
            fill={i <= score ? color : 'none'}
            stroke={i <= score ? color : `${C.outlineVar}60`}
            strokeWidth="1.2"/>
          <path d="M1.5 15c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"
            stroke={i <= score ? color : `${C.outlineVar}60`}
            strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        </svg>
      ))}
    </div>
  )
}

/* ── Spot card ────────────────────────────────────────────────── */
function SpotCard({ lib, onSelect, t }) {
  const open    = isLibOpen(lib.openingTime, lib.closingTime)
  const occ     = lib.occupancy ?? 50
  const { label, textColor } = getOccMeta(occ)
  const isCafe  = (lib.type ?? '').toLowerCase().includes('caf')
  const isWork  = (lib.type ?? '').toLowerCase().includes('workspace') || (lib.type ?? '').toLowerCase().includes('cowork')
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onClick={() => onSelect(lib)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer transition-all duration-200"
      style={{
        background: hovered ? '#ffffff' : '#ffffff',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: hovered ? '0 8px 24px rgba(0,93,164,0.08)' : 'none',
      }}
    >
      <div className="flex gap-3.5">
        {/* Thumbnail */}
        <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
          <div style={{
            width: 96, height: 96,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {lib.imageUrl ? (
              <img src={lib.imageUrl} alt={lib.name}
                   style={{
                     width: '100%', height: '100%',
                     objectFit: 'cover',
                     display: 'block',
                     transform: hovered ? 'scale(1.06)' : 'scale(1)',
                     transition: 'transform 0.5s ease',
                   }}
                   onError={e => {
                     e.currentTarget.style.display = 'none'
                     e.currentTarget.nextSibling.style.display = 'flex'
                   }} />
            ) : null}
            {/* Placeholder */}
            <div style={{
              width: '100%', height: '100%',
              display: lib.imageUrl ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
              background: isCafe
                ? `linear-gradient(135deg,#fff9ed,#ffefc4)`
                : isWork
                ? `linear-gradient(135deg,${C.surfaceLow},${C.primaryCont}35)`
                : `linear-gradient(135deg,${C.surfaceLow},${C.primary}12)`,
            }}>
              {isCafe ? '☕' : isWork ? '⌨️' : '📚'}
            </div>
          </div>
          {/* Open/Closed badge — outside overflow clip so it's never cut off */}
          {open !== null && (
            <div style={{
              position: 'absolute', top: 6, left: 6,
              background: open ? C.secondary : C.error,
              color: '#ffffff',
              fontSize: '9px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              padding: '2px 7px',
              borderRadius: 3,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              zIndex: 2,
            }}>
              {open ? t('open') : t('closed')}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
          <div>
            <h3 className="font-bold leading-tight truncate"
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '16px', fontWeight: 700,
                  color: C.text, letterSpacing: '-0.01em',
                }}>
              {lib.name}
            </h3>
            {lib.address && (
              <p className="text-xs mt-0.5 truncate"
                 style={{ color: C.muted, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {lib.address}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <PersonPips occupancy={occ} />
            <span className="text-xs font-bold" style={{ color: textColor,
              fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              {label}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ── Filter chip ──────────────────────────────────────────────── */
function FilterChip({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-none flex items-center gap-2 px-5 py-2.5 transition-all"
      style={{
        background: active ? C.primary : C.surfaceTop,
        color: active ? '#ffffff' : C.text,
        borderRadius: '9999px',
        fontSize: '13px', fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        border: `1px solid ${active ? C.primary : `rgba(155,173,215,0.25)`}`,
        boxShadow: active ? `0 4px 12px rgba(0,93,164,0.25)` : '0 1px 4px rgba(28,46,81,0.06)',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={15} strokeWidth={2} />
      {label}
    </button>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function MapTab({ libraries, onSelect, showBanner }) {
  const { t } = useLanguage()
  const [query,         setQuery]         = useState('')
  const [isOpen,        setIsOpen]        = useState(false)
  const [focusPoint,    setFocusPoint]    = useState(null)
  const [selectedLibId, setSelectedLibId] = useState(null)
  const [activeFilter,  setActiveFilter]  = useState(null)

  const topOffset = showBanner ? 'top-12' : 'top-4'

  const filters = [
    { id: 'quiet',  icon: Zap,   label: t('filterQuiet')   ?? 'Quiet'       },
    { id: 'wifi',   icon: Wifi,  label: t('filterWifi')    ?? 'Wi-Fi'       },
    { id: 'group',  icon: Users, label: t('filterGroup')   ?? 'Group Study' },
  ]

  const filtered = useMemo(() => {
    let list = libraries
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(lib =>
        lib.name.toLowerCase().includes(q) ||
        (lib.address ?? '').toLowerCase().includes(q) ||
        (lib.type    ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [libraries, query])

  function handleCardClick(lib) {
    setFocusPoint({ lat: lib.lat, lng: lib.lng, _t: Date.now() })
    setSelectedLibId(lib.id)
    setIsOpen(false)
    onSelect(lib)
  }

  function handleMarkerClick(lib) {
    setSelectedLibId(lib.id)
    onSelect(lib)
  }

  const openCount = filtered.filter(l => isLibOpen(l.openingTime, l.closingTime)).length

  return (
    <div className="absolute inset-0">
      {/* Full-screen map */}
      <Map
        libraries={filtered}
        onSelect={handleMarkerClick}
        focusPoint={focusPoint}
        selectedLibId={selectedLibId}
      />

      {/* ── Floating search bar ──────────────────────────────────── */}
      <div className={`absolute ${topOffset} left-4 right-4 z-[600]`}>
        <div className="flex items-center gap-3 px-5 py-3"
             style={{
               background: 'rgba(255,255,255,0.88)',
               backdropFilter: 'blur(24px)',
               WebkitBackdropFilter: 'blur(24px)',
               border: `1px solid rgba(155,173,215,0.18)`,
               borderRadius: '9999px',
               boxShadow: '0 8px 32px rgba(0,93,164,0.10)',
             }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true) }}
            placeholder={t('searchPlaceholder') ?? 'Find your focus…'}
            className="flex-1 bg-transparent outline-none font-semibold text-sm"
            style={{
              color: C.text,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              letterSpacing: '-0.01em',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')}
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: C.surfaceLow }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                   stroke={C.outline} strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter chips — hidden for now */}

      {/* ── Bottom sheet ─────────────────────────────────────────── */}
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: SHEET_H,
          background: '#ffffff',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.08)',
          zIndex: 500,
          borderRadius: '3rem 3rem 0 0',
          overflow: 'hidden',
        }}
        animate={{ y: isOpen ? 0 : PEEK_Y }}
        transition={{ type: 'spring', damping: 32, stiffness: 350 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: PEEK_Y }}
        dragElastic={{ top: 0.04, bottom: 0.08 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.y < -60 || info.velocity.y < -300) setIsOpen(true)
          else if (info.offset.y > 60 || info.velocity.y > 300) setIsOpen(false)
        }}
      >
        {/* Sheet header — white, clean */}
        <div style={{
          background: '#ffffff',
          borderRadius: '3rem 3rem 0 0',
          padding: '14px 24px 20px',
        }}>
          {/* Drag handle — gray */}
          <div className="flex justify-center pb-4 cursor-grab active:cursor-grabbing select-none">
            <div style={{ width: 40, height: 5, borderRadius: 9999, background: '#d1d8e8' }} />
          </div>

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: '22px', fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#1c2e51', lineHeight: 1.2,
              }}>
                {query ? t('resultsFor', query) : t('spotsNearYou')}
              </h2>
              <p style={{
                fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
                fontSize: '13px', fontWeight: 500,
                color: '#005da4', marginTop: 4,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#005da4', display: 'inline-block', flexShrink: 0,
                }} />
                {t('availablePlaces', filtered.length)}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable spot list */}
        <div
          className="px-6"
          style={{
            height: SHEET_H - 120,
            overflowY: isOpen ? 'auto' : 'hidden',
            scrollbarWidth: 'none',
          }}
          onPointerDown={isOpen ? e => e.stopPropagation() : undefined}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-semibold" style={{ color: C.muted }}>{t('noResults')}</p>
              <p className="text-xs" style={{ color: C.outlineVar }}>{t('tryOther')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(lib => (
                <SpotCard key={lib.id} lib={lib} onSelect={handleCardClick} t={t} />
              ))}
            </div>
          )}
          <div className="h-36" />
        </div>
      </motion.div>
    </div>
  )
}
