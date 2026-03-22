import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, ChevronRight } from 'lucide-react'
import Map from '../Map'
import { isLibOpen } from '../../utils/time'
import { useLanguage } from '../../context/LanguageContext'
import { CREME, MENTHE, EMER, VERRE, MOUSSE, MUTED, BORDER } from '../../palette'

/* ── Constantes sheet ─────────────────────────────────────────── */
// Les boutons flottants occupent ~80px depuis le bas (bottom-8 + 52px).
// PEEK_H assure que le haut de la sheet (handle + titre) commence
// juste au-dessus des boutons, laissant ~20px d'espace visuel.
const SHEET_H = 560   // hauteur totale de la feuille
const PEEK_H  = 160   // portion visible en mode "peek" (au-dessus des boutons)
const PEEK_Y  = SHEET_H - PEEK_H  // 400 — translateY en mode fermé

/* ── Jauge de 5 icônes User ────────────────────────────────────── */
function OccupancyGauge({ occupancy }) {
  let color, score
  if      (occupancy >= 80) { color = '#c9433a'; score = 5 }
  else if (occupancy >= 60) { color = '#e07c3a'; score = 4 }
  else if (occupancy >= 40) { color = '#d4a843'; score = 3 }
  else if (occupancy >= 20) { color = EMER;      score = 2 }
  else                      { color = EMER;      score = 1 }
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <User key={i} size={12} strokeWidth={2.5}
              style={{ color: i <= score ? color : BORDER }} />
      ))}
      <span className="ml-1 text-[11px] font-semibold" style={{ color }}>{score}/5</span>
    </div>
  )
}

/* ── Carte Uber Eats style ────────────────────────────────────── */
function typeIs(type, ...keywords) {
  const t = (type ?? '').toLowerCase()
  return keywords.some(k => t.includes(k))
}

function LibCard({ lib, onSelect, t }) {
  const isCafe      = typeIs(lib.type, 'caf')
  const isWorkspace = typeIs(lib.type, 'workspace', 'cowork')
  const open   = isLibOpen(lib.openingTime, lib.closingTime)

  return (
    <button
      onClick={() => onSelect(lib)}
      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
      style={{ borderBottom: `1px solid ${BORDER}` }}
      onMouseEnter={e => e.currentTarget.style.background='rgba(79,160,149,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden relative">
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
          className="absolute inset-0 items-center justify-center text-xl"
          style={{
            display: lib.imageUrl ? 'none' : 'flex',
            background: isCafe      ? `linear-gradient(135deg,${CREME},#e8e89a)`
                      : isWorkspace ? `linear-gradient(135deg,${MENTHE}35,${EMER}25)`
                      :               `linear-gradient(135deg,${MOUSSE}15,${EMER}20)`,
          }}
        >
          {isCafe ? '☕' : isWorkspace ? '💻' : '📚'}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-snug truncate" style={{ color: MOUSSE }}>{lib.name}</p>
        {lib.address && (
          <p className="text-[11px] truncate mt-0.5" style={{ color: MUTED }}>{lib.address}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <OccupancyGauge occupancy={lib.occupancy ?? 50} />
          {open !== null && (
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: open ? MENTHE : '#e07070' }} />
              <span className="text-[11px] font-medium" style={{ color: MUTED }}>
                {open ? t('open') : t('closed')}
              </span>
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={14} strokeWidth={2.5} className="shrink-0" style={{ color: MUTED }} />
    </button>
  )
}

/* ── Composant principal ──────────────────────────────────────── */
export default function MapTab({ libraries, onSelect, showBanner }) {
  const { t } = useLanguage()
  const [query,          setQuery]          = useState('')
  const [isOpen,         setIsOpen]         = useState(false)
  const [focusPoint,     setFocusPoint]     = useState(null)
  const [selectedLibId,  setSelectedLibId]  = useState(null)

  const topOffset = showBanner ? 'top-10' : 'top-4'

  /* Filtrage temps réel */
  const filtered = useMemo(() => {
    if (!query.trim()) return libraries
    const q = query.toLowerCase()
    return libraries.filter(lib =>
      lib.name.toLowerCase().includes(q) ||
      (lib.address ?? '').toLowerCase().includes(q) ||
      (lib.type  ?? '').toLowerCase().includes(q)
    )
  }, [libraries, query])

  /* Clic sur une carte de la liste */
  function handleCardClick(lib) {
    setFocusPoint({ lat: lib.lat, lng: lib.lng, _t: Date.now() })
    setSelectedLibId(lib.id)
    setIsOpen(false)
    onSelect(lib)
  }

  /* Clic direct sur un marqueur */
  function handleMarkerClick(lib) {
    setSelectedLibId(lib.id)
    onSelect(lib)
  }

  return (
    <div className="absolute inset-0">

      {/* ── Carte plein écran ────────────────────────────────────── */}
      <Map
        libraries={filtered}
        onSelect={handleMarkerClick}
        focusPoint={focusPoint}
        selectedLibId={selectedLibId}
      />

      {/* ── Barre de recherche flottante ────────────────────────── */}
      <div className={`absolute ${topOffset} left-4 right-4 z-[600]`}>
        <div
          className="flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lg shadow-black/8"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
            placeholder={t('searchPlaceholder')}
            className="flex-1 bg-transparent text-sm text-slate-800
                       placeholder-slate-400 font-medium outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-5 h-5 rounded-full bg-slate-200 flex items-center
                         justify-center shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                   stroke="#64748b" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Peek-a-boo bottom sheet ──────────────────────────────── */}
      <motion.div
        className="absolute left-0 right-0 bottom-0 rounded-t-[28px]"
        style={{
          height: SHEET_H,
          background: '#fff',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.07)',
          zIndex: 500,
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
        {/* ── Handle bar ─────────────────────────────────────────── */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none">
          <div className="w-9 h-1 rounded-full" style={{ background: `${VERRE}80` }} />
        </div>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base tracking-tight leading-tight"
                style={{ color: MOUSSE }}>
              {query ? t('resultsFor', query) : t('spotsNearYou')}
            </h3>
            <p className="text-xs font-medium mt-0.5" style={{ color: EMER }}>
              {t('availablePlaces', filtered.length)}
            </p>
          </div>
          {!isOpen && (
            <div className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 select-none"
                 style={{ background: `${EMER}15`, color: EMER }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              {t('swipeUp')}
            </div>
          )}
          {isOpen && (
            <button onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${EMER}15`, color: EMER }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── Séparateur ─────────────────────────────────────────── */}
        <div className="h-px" style={{ background: `${VERRE}50` }} />

        {/* ── Liste scrollable ────────────────────────────────────── */}
        <div
          className="divide-y"
          style={{
            height: SHEET_H - 100,
            overflowY: isOpen ? 'auto' : 'hidden',
          }}
          onPointerDown={isOpen ? (e) => e.stopPropagation() : undefined}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <p className="text-3xl">🔍</p>
              <p className="text-sm font-semibold text-slate-500">{t('noResults')}</p>
              <p className="text-xs text-slate-400">{t('tryOther')}</p>
            </div>
          ) : (
            filtered.map(lib => (
              <LibCard key={lib.id} lib={lib} onSelect={handleCardClick} t={t} />
            ))
          )}
          {/* Padding pour les boutons flottants (bottom-8 + 52px) */}
          <div className="h-36" />
        </div>
      </motion.div>
    </div>
  )
}
