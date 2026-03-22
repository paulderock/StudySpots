import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, Users, UsersRound, Users2, MapPin, Clock, Star, BookOpen, Coffee, Zap, Lock, Monitor } from 'lucide-react'
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
const FD  = MOUSSE   // navy profond — headers, textes forts
const FL  = EMER     // icons / labels
const SAG = EMER     // accents / dots
const CRM = CREME    // blanc pur — texte sur foncé
const BG  = IVOIRE   // ivoire froid — fond app

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

/* ─── Panneau détail bibliothèque ────────────────────────────────── */
function LibrarySheet({ lib, onClose, onReport }) {
  const { t } = useLanguage()
  const [view, setView] = useState('detail')
  useEffect(() => { setView('detail') }, [lib?.id])

  const color    = getHeatColor(lib.occupancy)
  const label    = getOccupancyLabel(lib.occupancy, t)
  const open     = isLibOpen(lib.openingTime, lib.closingTime)
  const hours    = formatHours(lib.openingTime, lib.closingTime)
  const canReport = open !== false

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
    <div className="pb-8">

      {/* ── Hero image ────────────────────────────────────────────── */}
      <div className="relative w-full h-52 overflow-hidden rounded-t-[32px]">

        {lib.imageUrl ? (
          <img src={lib.imageUrl} alt={lib.name}
               className="w-full h-full object-cover"
               onError={(e) => {
                 e.currentTarget.style.display = 'none'
                 e.currentTarget.nextSibling.style.display = 'flex'
               }} />
        ) : null}
        <div style={{ display: lib.imageUrl ? 'none' : 'flex' }} className="w-full h-full">
          <PlaceholderImage type={lib.type} />
        </div>

        {/* Dégradé bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Handle bar */}
        <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-9 h-1 rounded-full bg-white/50" />
        </div>

        {/* Badge ouvert/fermé */}
        <div className="absolute top-3 left-3">
          <OpenBadge openingTime={lib.openingTime} closingTime={lib.closingTime} />
        </div>

        {/* Bouton fermeture */}
        <button onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full
                     flex items-center justify-center text-white text-sm
                     transition-colors"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          ✕
        </button>

        {/* Titre + vibe sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          {lib.vibe && (
            <p className="text-white/70 text-xs font-medium mb-1 tracking-wide">{lib.vibe}</p>
          )}
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight drop-shadow-lg">
            {lib.name}
          </h2>
        </div>
      </div>

      {/* ── Contenu ───────────────────────────────────────────────── */}
      <div className="px-4 pt-4">

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {lib.type && <TypeBadge type={lib.type} />}
          {lib.lastUpdated ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5 border"
                  style={isStale(lib.lastUpdated)
                    ? { color: '#9CA3AF', background: '#F9FAFB', borderColor: '#E5E7EB' }
                    : { color: EMER, background: `${EMER}12`, borderColor: `${EMER}30` }}>
              {isStale(lib.lastUpdated)
                ? <Clock size={11} strokeWidth={2} />
                : <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SAG }} />}
              {formatTimeAgo(lib.lastUpdated, t)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5"
                  style={{ color: '#94a3b8', background: `${FD}08`, border: `1px solid rgba(0,0,0,0.07)` }}>
              <Clock size={11} strokeWidth={2} /> {t('noReport')}
            </span>
          )}
        </div>

        {/* Infos pratiques */}
        <div className="rounded-2xl overflow-hidden divide-y mb-4"
             style={{ background: BG, border: `1px solid rgba(0,0,0,0.07)`, divideColor: 'rgba(0,0,0,0.05)' }}>

          {lib.address && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lib.address)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-start gap-3 px-4 py-3 transition-colors"
               style={{ borderBottom: `1px solid rgba(0,0,0,0.05)` }}>
              <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: SAG }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                   style={{ color: `${FD}60` }}>{t('address')}</p>
                <p className="text-sm leading-snug" style={{ color: FD }}>{lib.address}</p>
              </div>
              <span className="text-xs self-center shrink-0" style={{ color: SAG }}>↗</span>
            </a>
          )}

          {hours && (
            <div className="flex items-center gap-3 px-4 py-3"
                 style={{ borderBottom: lib.highlight ? `1px solid rgba(0,0,0,0.05)` : 'none' }}>
              <Clock size={14} className="shrink-0" style={{ color: SAG }} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                   style={{ color: `${FD}60` }}>{t('hours')}</p>
                <p className="text-sm" style={{ color: FD }}>{hours}</p>
              </div>
            </div>
          )}

          {lib.highlight && (
            <div className="flex items-start gap-3 px-4 py-3">
              <Star size={14} className="mt-0.5 shrink-0" style={{ color: '#d4a843' }} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                   style={{ color: `${FD}60` }}>{t('highlights')}</p>
                <p className="text-sm leading-snug" style={{ color: FD }}>{lib.highlight}</p>
              </div>
            </div>
          )}
        </div>

        {/* Barre d'occupation */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-sm font-semibold" style={{ color: FD }}>{t('percentFull', lib.occupancy)}</span>
            <span className="text-sm font-bold" style={{ color }}>{label}</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: `${FD}12` }}>
            <div className="h-2 rounded-full transition-all duration-500"
                 style={{ width: `${lib.occupancy}%`, background: color }} />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: `${FD}40` }}>
            <span>{t('empty')}</span><span>{t('full')}</span>
          </div>
        </div>

        {/* Bouton signalement */}
        {canReport ? (
          <ReportButton onPress={() => setView('report')} />
        ) : (
          <div className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5
                          text-sm font-medium cursor-not-allowed"
               style={{ background: `${FD}08`, color: `${FD}50` }}>
            <Lock size={14} strokeWidth={2} />
            {t('closedReport')}
          </div>
        )}

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
  return (
    <LanguageProvider>
      <AuthProvider>
        <UserProvider>
          <AuthGate>
            <AppInner />
          </AuthGate>
        </UserProvider>
      </AuthProvider>
    </LanguageProvider>
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

  const showBanner = isMock && import.meta.env.DEV

  useEffect(() => {
    if (!selectedLib) return
    const updated = libraries.find((l) => l.id === selectedLib.id)
    if (updated) setSelectedLib(updated)
  }, [libraries])

  function handleSelectLib(lib) {
    setSelectedLib(lib)
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
            <ExploreTab libraries={libraries} onSelect={handleSelectLib} />
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

      {/* ── Bottom sheet détail (overlay global) ─────────────────── */}
      <AnimatePresence>
        {selectedLib && (
          <>
            <motion.div
              key="backdrop"
              className="absolute inset-0 z-[1002]"
              style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedLib(null)}
            />
            <motion.div
              key="detail-sheet"
              className="absolute bottom-0 left-0 right-0 z-[1003]
                         rounded-t-[32px] shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.97)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100) setSelectedLib(null) }}
              onClick={(e) => e.stopPropagation()}
            >
              <LibrarySheet
                lib={selectedLib}
                onClose={() => setSelectedLib(null)}
                onReport={handleReport}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
