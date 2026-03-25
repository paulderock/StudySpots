import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import { UserRound, Users, UsersRound, Users2, MapPin, Clock, Star, BookOpen, Coffee, Zap, Lock, Monitor, Wifi, CheckCircle2, ArrowLeft, X } from 'lucide-react'
import { isLibOpen, formatHours } from './utils/time'
import BottomNav from './components/BottomNav'
import ExploreTab from './components/tabs/ExploreTab'
import MapTab from './components/tabs/MapTab'
import ProfileTab from './components/tabs/ProfileTab'
import Auth from './components/Auth'
import { useStudySpots } from './hooks/useStudySpots'
import { UserProvider, useUser } from './context/UserContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { CREME, IVOIRE, MENTHE, EMER, VERRE, MOUSSE, MUTED, BORDER } from './palette'

/* ─── Aliases locaux pour lisibilité ────────────────────────────── */
const FD  = MOUSSE
const FL  = EMER
const SAG = EMER
const CRM = CREME
const BG  = IVOIRE

/* ─── Design tokens (Stitch Lumina palette) ─────────────────────── */
const D = {
  bg:          '#f5f6ff',
  surfaceTop:  '#ffffff',
  surfaceLow:  '#edf0ff',
  primary:     '#005da4',
  primaryCont: '#4fa4ff',
  secondary:   '#00694d',
  secCont:     '#60fcc6',
  onSecCont:   '#005e44',
  tertiary:    '#6e5900',
  tertCont:    '#fcd43e',
  error:       '#b31b25',
  errCont:     '#fb5151',
  text:        '#1c2e51',
  muted:       '#4a5b80',
  outline:     '#65779d',
  outlineVar:  '#9badd7',
  surfaceVar:  '#d0ddff',
}

/* ─── Config notation ────────────────────────────────────────────── */
const RATINGS_BASE = [
  { value: 1, key: 'rating1', color: EMER,      pastel: '#e8f4f2', glow: `${EMER}30` },
  { value: 2, key: 'rating2', color: EMER,      pastel: '#eef6f4', glow: `${EMER}30` },
  { value: 3, key: 'rating3', color: '#d4a843', pastel: '#fdf5dc', glow: '#d4a84330' },
  { value: 4, key: 'rating4', color: '#e07c3a', pastel: '#fdf0e6', glow: '#e07c3a30' },
  { value: 5, key: 'rating5', color: '#c9433a', pastel: '#fdecea', glow: '#c9433a30' },
]

/* ─── Helpers ────────────────────────────────────────────────────── */
function getHeatColor(occupancy) {
  if (occupancy >= 70) return '#c9433a'
  if (occupancy >= 40) return '#d4a843'
  return EMER
}
function getOccupancyLabel(occupancy, t) {
  if (occupancy >= 80) return t('occupancyVeryBusy')
  if (occupancy >= 60) return t('occupancyBusy')
  if (occupancy >= 30) return t('occupancyCalm')
  return t('occupancyVeryCalm')
}
const STALE_MS = 5 * 60 * 60 * 1000
function isStale(lastUpdated) {
  if (!lastUpdated) return true
  return Date.now() - new Date(lastUpdated).getTime() > STALE_MS
}
function formatTimeAgo(lastUpdated, t) {
  if (!lastUpdated) return null
  const diffMs  = Date.now() - new Date(lastUpdated).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1)  return t('justNow')
  if (diffMin < 60) return t('minutesAgo', diffMin)
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return t('hoursAgo', diffH)
  return t('daysAgo', Math.floor(diffH / 24))
}

/* ─── Icônes densité ─────────────────────────────────────────────── */
function CrowdLevelIcon({ value, color, size = 26 }) {
  const props = { size, color, strokeWidth: 2 }
  if (value === 5) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Users2 {...props} strokeWidth={2.5} />
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
                         flex items-center justify-center text-white font-black"
              style={{ background: color, fontSize: '9px' }}>+</span>
      </div>
    )
  }
  const IconMap = { 1: UserRound, 2: Users, 3: UsersRound, 4: Users2 }
  const Icon = IconMap[value]
  return <Icon {...props} />
}

/* ─── Badge ouvert / fermé ───────────────────────────────────────── */
function OpenBadge({ openingTime, closingTime }) {
  const open = isLibOpen(openingTime, closingTime)
  if (open === null) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold
                     rounded-full px-2.5 py-0.5"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff' }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: open ? '#4ade80' : '#f87171' }} />
      {open ? 'Open' : 'Closed'}
    </span>
  )
}

/* ─── Placeholder image ──────────────────────────────────────────── */
function typeIs(type, ...keywords) {
  const t = (type ?? '').toLowerCase()
  return keywords.some(k => t.includes(k))
}

function PlaceholderImage({ type }) {
  const isCafe      = typeIs(type, 'caf')
  const isWorkspace = typeIs(type, 'workspace', 'cowork')
  const bg = isCafe      ? `linear-gradient(135deg,#FFF9ED,#FFF0C4)`
           : isWorkspace ? `linear-gradient(135deg,${MENTHE}30,${EMER}25)`
           :               `linear-gradient(135deg,${MOUSSE}08,${EMER}18)`
  const emoji = isCafe ? '☕' : isWorkspace ? '💻' : '📚'
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
         style={{ background: bg }}>
      <span className="text-5xl select-none">{emoji}</span>
      <span className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: `${FD}60` }}>
        {type ?? 'Spot'}
      </span>
    </div>
  )
}

/* ─── Badge type ─────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  const isCafe      = typeIs(type, 'caf')
  const isWorkspace = typeIs(type, 'workspace', 'cowork')
  const Icon   = isCafe ? Coffee : isWorkspace ? Monitor : BookOpen
  const color  = isCafe ? '#7a6030' : FL
  const pastBg = isCafe ? `${CRM}` : `${SAG}18`
  const border = isCafe ? `rgba(180,150,60,0.30)` : `${SAG}50`
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5"
          style={{ color, background: pastBg, border: `1px solid ${border}` }}>
      <Icon size={11} strokeWidth={2} />
      {type ?? 'Spot'}
    </span>
  )
}

/* ─── Vue : signalement ──────────────────────────────────────────── */
function ReportView({ lib, onConfirm, onBack }) {
  const { t } = useLanguage()
  const RATINGS = RATINGS_BASE.map(r => ({ ...r, label: t(r.key) }))
  const [rating,      setRating]      = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const selected = RATINGS.find((r) => r.value === rating)

  async function handleConfirm() {
    if (!rating || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onConfirm(rating)
    } catch {
      setSubmitError(t('reportError'))
      setSubmitting(false)
    }
  }

  return (
    <div className="px-5 pt-2 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} disabled={submitting}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
          style={{ background: `${SAG}18`, color: FD }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div>
          <h2 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
            {lib.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('reportTitle')}</p>
        </div>
      </div>

      {/* Grille 1–5 */}
      <div className="flex justify-between gap-2 mb-4">
        {RATINGS.map((r) => {
          const isSelected = rating === r.value
          const isActive   = rating !== null && r.value <= rating
          return (
            <button
              key={r.value}
              onClick={() => { setRating(r.value); setSubmitError(null) }}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl
                         transition-all duration-200 focus:outline-none disabled:opacity-50"
              style={{
                background:  isSelected ? r.pastel : 'rgba(248,250,252,0.8)',
                border:      isSelected ? `1.5px solid ${r.color}55` : '1.5px solid rgba(226,232,240,0.8)',
                transform:   isSelected ? 'scale(1.12)' : 'scale(1)',
                boxShadow:   isSelected ? `0 8px 24px ${r.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                filter:  isSelected ? `drop-shadow(0 0 8px ${r.color}99)` : 'none',
                opacity: !isActive && rating !== null ? 0.25 : 1,
                transition: 'all 0.2s',
              }}>
                <CrowdLevelIcon
                  value={r.value}
                  color={isActive ? r.color : '#cbd5e1'}
                  size={26}
                />
              </div>
              <span className="text-xs font-bold transition-colors duration-200"
                    style={{ color: isActive ? r.color : '#94a3b8' }}>
                {r.value}
              </span>
            </button>
          )
        })}
      </div>

      {/* Label sélectionné */}
      <div className="h-8 flex items-center justify-center mb-5">
        {selected ? (
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full"
                style={{ color: selected.color, background: selected.pastel }}>
            {selected.value}/5 — {selected.label}
          </span>
        ) : (
          <span className="text-sm text-slate-400">{t('reportSelect')}</span>
        )}
      </div>

      {/* Erreur */}
      {submitError && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-100
                        flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <p className="text-sm text-red-600 font-medium">{submitError}</p>
        </div>
      )}

      {/* Bouton confirmer */}
      <button
        disabled={!rating || submitting}
        onClick={handleConfirm}
        className="w-full font-semibold text-base rounded-2xl py-4
                   flex items-center justify-center gap-2 transition-all duration-200"
        style={rating && !submitting ? {
          background: FD,
          color: CRM,
          boxShadow: `0 6px 20px ${FD}40`,
        } : {
          background: `${FD}10`,
          color: '#94a3b8',
          cursor: 'not-allowed',
        }}
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            {t('reporting')}
          </>
        ) : t('reportConfirm')}
      </button>

      <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">{t('reportHelp')}</p>
    </div>
  )
}

/* ─── Vue : succès ───────────────────────────────────────────────── */
function SuccessView({ onClose }) {
  const { t } = useLanguage()
  return (
    <div className="px-5 pt-6 pb-10 flex flex-col items-center text-center">
      <div className="check-pop w-20 h-20 rounded-full flex items-center justify-center mb-5"
           style={{ background: `${SAG}15`, border: `2px solid ${SAG}40` }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path className="draw-check" d="M8 21 L17 30 L33 12"
                stroke={SAG} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2 tracking-tight" style={{ color: FD }}>{t('successTitle')}</h2>
      <p className="text-sm mb-1" style={{ color: '#64748b' }}>{t('successBody')}</p>
      <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>{t('successRT')}</p>
      <p className="text-xs font-bold mb-8" style={{ color: FL }}>{t('successPts')}</p>
      <button onClick={onClose}
        className="px-8 py-3 rounded-2xl font-semibold text-sm transition-colors"
        style={{ background: FD, color: CRM }}>
        {t('backToMap')}
      </button>
    </div>
  )
}

/* ─── Bouton signalement — design pro ────────────────────────────── */
function ReportButton({ onPress }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>
        {t('reportBtnLabel')}
      </p>

      {/* Bouton */}
      <motion.button
        onClick={onPress}
        whileTap={{
          scale: 0.96,
          y: 1,
          x: [0, -1, 1, -1, 0],
          transition: { x: { duration: 0.2, ease: 'easeInOut' }, scale: { duration: 0.1 } },
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="btn-shimmer w-full flex items-center justify-center gap-3
                   text-white rounded-xl py-4 px-6"
        style={{
          background: FD,
          border: `1px solid ${SAG}30`,
          boxShadow: `0 8px 24px ${FD}35, 0 2px 6px rgba(0,0,0,0.10)`,
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          color: CRM,
        }}
      >
        {/* Live dot — sage pulsant */}
        <span className="live-dot shrink-0" style={{
          width: 8, height: 8, borderRadius: '50%',
          background: SAG, display: 'inline-block',
          boxShadow: `0 0 6px ${SAG}`,
        }} />
        {t('reportBtnText')}
      </motion.button>
    </div>
  )
}

/* ─── Occupancy meta (Stitch semantic colors) ────────────────────── */
function getOccMeta(occ) {
  if (occ >= 80) return { score: 5, color: D.error,    label: 'At Capacity', bg: `${D.errCont}20`,  textColor: D.error    }
  if (occ >= 60) return { score: 4, color: '#c9433a',  label: 'Busy',        bg: 'rgba(201,67,58,0.12)', textColor: '#c9433a' }
  if (occ >= 40) return { score: 3, color: D.tertiary, label: 'Buzzing',     bg: `${D.tertCont}45`, textColor: D.tertiary }
  if (occ >= 20) return { score: 2, color: D.secondary,label: 'Quiet',       bg: `${D.secCont}40`,  textColor: D.secondary }
  return               { score: 1, color: D.secondary, label: 'Very quiet',   bg: `${D.secCont}35`,  textColor: D.secondary }
}

/* ─── 5-person pip row (Stitch style) ───────────────────────────── */
function PersonPips({ score, color }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="18" height="22" viewBox="0 0 18 22" fill="none">
          <circle cx="9" cy="6" r="4.5"
            fill={i <= score ? color : 'none'}
            stroke={i <= score ? color : D.surfaceVar}
            strokeWidth="1.5"/>
          <path d="M1.5 21c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5"
            stroke={i <= score ? color : D.surfaceVar}
            strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      ))}
    </div>
  )
}

/* ─── Icon circle helper ─────────────────────────────────────────── */
function IconCircle({ children }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
         style={{ background: `rgba(0,93,164,0.10)` }}>
      <span style={{ color: D.primary, display: 'flex' }}>{children}</span>
    </div>
  )
}

/* ─── Panneau détail bibliothèque — Stitch Study Spot Detail ────── */
function LibrarySheet({ lib, onClose, onReport, isFullScreen }) {
  const { t } = useLanguage()
  const [view, setView] = useState('detail')
  useEffect(() => { setView('detail') }, [lib?.id])

  const occ      = lib.occupancy ?? 50
  const occMeta  = getOccMeta(occ)
  const open     = isLibOpen(lib.openingTime, lib.closingTime)
  const hours    = formatHours(lib.openingTime, lib.closingTime)
  const canReport = open !== false
  const isCafe   = (lib.type ?? '').toLowerCase().includes('caf')
  const isWork   = (lib.type ?? '').toLowerCase().includes('workspace') || (lib.type ?? '').toLowerCase().includes('cowork')

  if (view === 'success') return <SuccessView onClose={onClose} />
  if (view === 'report') {
    return (
      <ReportView
        lib={lib}
        onBack={() => setView('detail')}
        onConfirm={async (rating) => {
          await onReport(lib.id, rating)
          setView('success')
        }}
      />
    )
  }

  return (
    <div style={{
      height: '100%', background: D.bg, scrollbarWidth: 'none',
      overflowY: isFullScreen ? 'auto' : 'hidden',
    }}>
      {/* ── Hero image ────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: 260 }}>
        {/* Drag handle overlaid on top of the image */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-3 z-20 select-none pointer-events-none">
          <div style={{ width: 40, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.55)' }} />
        </div>
        {lib.imageUrl ? (
          <img src={lib.imageUrl} alt={lib.name}
               className="absolute inset-0 w-full h-full object-cover"
               onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
        ) : null}
        <div className="absolute inset-0 flex"
             style={{ display: lib.imageUrl ? 'none' : 'flex' }}>
          <PlaceholderImage type={lib.type} />
        </div>
        {/* Gradient vignette */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'linear-gradient(to top, rgba(245,246,255,0.45) 0%, transparent 60%)' }} />
        {/* Nav overlays */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-5 z-10">
          <button onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', boxShadow: '0 2px 8px rgba(28,46,81,0.12)' }}>
            <ArrowLeft size={18} strokeWidth={2} style={{ color: D.text }} />
          </button>
          <button onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', boxShadow: '0 2px 8px rgba(28,46,81,0.12)' }}>
            <X size={18} strokeWidth={2} style={{ color: D.text }} />
          </button>
        </div>
      </div>

      {/* ── Content canvas — overlaps hero ──────────────────────────── */}
      <div className="relative px-4 pb-10" style={{ marginTop: -36, zIndex: 20 }}>
        <div className="space-y-4 max-w-lg mx-auto">

          {/* Identity card */}
          <section style={{
            background: D.surfaceTop, borderRadius: '1rem', padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(28,46,81,0.06)',
          }}>
            {/* Status badge */}
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider"
                  style={{
                    background: occMeta.bg, color: occMeta.textColor,
                    borderRadius: '0.25rem', padding: '4px 10px',
                    fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
              <CheckCircle2 size={13} strokeWidth={2.5} />
              {occMeta.label}
              {!isStale(lib.lastUpdated) && lib.lastUpdated && (
                <span className="normal-case tracking-normal font-normal opacity-70 ml-1">
                  · {formatTimeAgo(lib.lastUpdated, t)}
                </span>
              )}
            </span>

            {/* Name */}
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em',
              color: D.text, lineHeight: 1.15, marginTop: 10, marginBottom: 6,
            }}>
              {lib.name}
            </h1>

            {/* Address */}
            {lib.address && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lib.address)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 transition-opacity active:opacity-70">
                <MapPin size={15} strokeWidth={1.8} style={{ color: D.outline, flexShrink: 0 }} />
                <p className="text-sm font-medium" style={{ color: D.muted }}>{lib.address}</p>
                <span className="text-xs ml-auto shrink-0" style={{ color: D.primary }}>↗</span>
              </a>
            )}

            {/* Live Occupancy */}
            <div className="mt-6 pt-5" style={{ borderTop: `1px solid rgba(155,173,215,0.18)` }}>
              <div className="flex justify-between items-end">
                <div>
                  <p style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.16em', color: D.muted, marginBottom: 8,
                  }}>
                    Live Occupancy
                  </p>
                  <PersonPips score={occMeta.score} color={occMeta.color} />
                </div>
                <p className="text-sm font-semibold" style={{ color: D.secondary }}>
                  {occ < 40 ? t('occupancyVeryCalm') : occ < 60 ? t('occupancyCalm') : occ < 80 ? t('occupancyBusy') : t('occupancyVeryBusy')}
                </p>
              </div>
            </div>
          </section>

          {/* Info bento grid — 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hours card */}
            <div className="flex items-start gap-3 p-5" style={{
              background: D.surfaceLow, borderRadius: '1rem',
            }}>
              <IconCircle><Clock size={18} strokeWidth={1.8} /></IconCircle>
              <div>
                <p style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.14em', color: D.muted, marginBottom: 4,
                }}>
                  Hours
                </p>
                <p className="font-bold text-sm" style={{ color: D.text }}>
                  {hours ?? (open === null ? '—' : open ? 'Open' : 'Closed')}
                </p>
                {open !== null && (
                  <p className="text-xs mt-0.5 font-medium" style={{ color: open ? D.secondary : D.error }}>
                    {open ? 'Open now' : 'Closed'}
                  </p>
                )}
              </div>
            </div>

            {/* Amenities card */}
            <div className="flex items-start gap-3 p-5" style={{
              background: D.surfaceLow, borderRadius: '1rem',
            }}>
              <IconCircle><Zap size={18} strokeWidth={1.8} /></IconCircle>
              <div>
                <p style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.14em', color: D.muted, marginBottom: 8,
                }}>
                  Amenities
                </p>
                <div className="flex gap-2.5">
                  <Zap size={17} strokeWidth={1.8} style={{ color: D.text }} title="Power Outlets" />
                  <Wifi size={17} strokeWidth={1.8} style={{ color: D.text }} title="WiFi" />
                  {isCafe && <Coffee size={17} strokeWidth={1.8} style={{ color: D.text }} title="Coffee" />}
                  {isWork && <Monitor size={17} strokeWidth={1.8} style={{ color: D.text }} title="Workstations" />}
                  {!isCafe && !isWork && <BookOpen size={17} strokeWidth={1.8} style={{ color: D.text }} title="Study Space" />}
                </div>
              </div>
            </div>
          </div>

          {/* About / Highlight */}
          {lib.highlight && (
            <section style={{
              background: D.surfaceTop, borderRadius: '1rem', padding: '1.5rem',
              boxShadow: '0 4px 24px rgba(28,46,81,0.04)',
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: '16px', fontWeight: 700, color: D.text, marginBottom: 10,
              }}>
                About the space
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: D.muted }}>{lib.highlight}</p>
            </section>
          )}

          {/* CTA — Report a Crowd Level */}
          <div className="pt-2 pb-2">
            {canReport ? (
              <motion.button
                onClick={() => setView('report')}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${D.primary} 0%, ${D.primaryCont} 100%)`,
                  height: 64, borderRadius: '1rem',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: '16px', fontWeight: 700, color: '#edf3ff',
                  boxShadow: '0 8px 24px rgba(0,93,164,0.28)',
                  letterSpacing: '-0.01em',
                }}
              >
                <Users size={20} strokeWidth={2} />
                {t('reportBtnText')}
              </motion.button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 cursor-not-allowed"
                   style={{
                     height: 64, borderRadius: '1rem',
                     background: `rgba(0,93,164,0.06)`,
                     fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                     fontSize: '14px', fontWeight: 600, color: `rgba(28,46,81,0.35)`,
                   }}>
                <Lock size={16} strokeWidth={2} />
                {t('closedReport')}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Gate Auth : affiche Auth si pas de session ────────────────── */
function AuthGate({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
      </div>
    )
  }

  if (!user) return <Auth />
  return children
}

/* ─── App root ───────────────────────────────────────────────────── */
export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      </AnimatePresence>
      {splashDone && (
        <LanguageProvider>
          <AuthProvider>
            <UserProvider>
              <AuthGate>
                <AppInner />
              </AuthGate>
            </UserProvider>
          </AuthProvider>
        </LanguageProvider>
      )}
    </>
  )
}

/* ─── App inner ──────────────────────────────────────────────────── */
const tabVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.12, ease: 'easeIn' } },
}

function AppInner() {
  const { libraries, loading, isMock, report } = useStudySpots()
  const { addScore } = useUser()
  const { t } = useLanguage()
  const [activeTab,   setActiveTab]   = useState('explore')
  const [selectedLib, setSelectedLib] = useState(null)
  const [sheetFull,   setSheetFull]   = useState(false)

  const showBanner = isMock && import.meta.env.DEV

  useEffect(() => {
    if (!selectedLib) return
    const updated = libraries.find((l) => l.id === selectedLib.id)
    if (updated) setSelectedLib(updated)
  }, [libraries])

  function handleSelectLib(lib) {
    setSelectedLib(lib)
    setSheetFull(false)
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSelectedLib(null)
  }

  async function handleReport(libId, rating) {
    await report(libId, rating)
    addScore(50)
  }

  /* Chargement */
  if (loading) {
    return (
      <div className="h-screen w-full max-w-lg mx-auto flex flex-col items-center
                      justify-center gap-3" style={{ background: BG }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: `${SAG} transparent transparent transparent` }} />
        <p className="text-sm text-slate-400 font-medium">{t('loadingSpots')}</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full max-w-lg mx-auto overflow-hidden" style={{ background: BG }}>

      {/* Bannière démo — local uniquement */}
      {showBanner && (
        <div className="absolute top-0 left-0 right-0 z-[1002] bg-amber-400/90
                        backdrop-blur-sm text-amber-900 text-xs font-medium
                        text-center py-1.5 px-4">
          {t('demoBanner')}
        </div>
      )}

      {/* ── Contenu des onglets ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'explore' && (
          <motion.div key="explore" className="absolute inset-0" variants={tabVariants}
                      initial="initial" animate="animate" exit="exit">
            <ExploreTab libraries={libraries} onSelect={handleSelectLib} onNavigate={setActiveTab} />
          </motion.div>
        )}
        {activeTab === 'map' && (
          <motion.div key="map" className="absolute inset-0" variants={tabVariants}
                      initial="initial" animate="animate" exit="exit">
            <MapTab libraries={libraries} onSelect={handleSelectLib} showBanner={showBanner} />
          </motion.div>
        )}
        {activeTab === 'profile' && (
          <motion.div key="profile" className="absolute inset-0" variants={tabVariants}
                      initial="initial" animate="animate" exit="exit">
            <ProfileTab />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Nav (masquée quand une fiche est ouverte) ──────── */}
      <AnimatePresence>
        {!selectedLib && (
          <motion.div
            key="bottom-nav"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="absolute inset-x-0 bottom-0 z-[1001]"
          >
            <BottomNav active={activeTab} onChange={handleTabChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail sheet — peek or full ───────────────────────────── */}
      <AnimatePresence>
        {selectedLib && (
          <motion.div
            key="detail-sheet"
            className="absolute bottom-0 left-0 right-0 z-[1003]"
            style={{
              height: '100vh',
              background: '#f5f6ff',
              borderRadius: '2rem 2rem 0 0',
              overflow: 'hidden',
              boxShadow: '0 -8px 40px rgba(28,46,81,0.15)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: sheetFull ? '0%' : '38%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.08, bottom: 0.15 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const { offset, velocity } = info
              if (offset.y < -60 || velocity.y < -400) {
                // drag up → expand to full
                setSheetFull(true)
              } else if (offset.y > 80 || velocity.y > 400) {
                if (sheetFull) {
                  // drag down from full → back to peek
                  setSheetFull(false)
                } else {
                  // drag down from peek → dismiss
                  setSelectedLib(null)
                }
              }
            }}
          >
            <LibrarySheet
              lib={selectedLib}
              onClose={() => setSelectedLib(null)}
              onReport={handleReport}
              isFullScreen={sheetFull}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
