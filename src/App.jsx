import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, Users, UsersRound, Users2, MapPin, Clock, Star, BookOpen, Coffee } from 'lucide-react'
import { isLibOpen, formatHours } from './utils/time'
import BottomNav from './components/BottomNav'
import ExploreTab from './components/tabs/ExploreTab'
import MapTab from './components/tabs/MapTab'
import ProfileTab from './components/tabs/ProfileTab'
import { useStudySpots } from './hooks/useStudySpots'
import { UserProvider, useUser } from './context/UserContext'

/* ─── Config notation ────────────────────────────────────────────── */
const RATINGS = [
  { value: 1, label: 'Vide',        color: '#10b981', pastel: '#d1fae5', glow: '#10b98140' },
  { value: 2, label: 'Calme',       color: '#34d399', pastel: '#d1fae5', glow: '#34d39940' },
  { value: 3, label: 'Modéré',      color: '#f59e0b', pastel: '#fef3c7', glow: '#f59e0b40' },
  { value: 4, label: 'Très occupé', color: '#f97316', pastel: '#ffedd5', glow: '#f9731640' },
  { value: 5, label: 'Complet',     color: '#ef4444', pastel: '#fee2e2', glow: '#ef444440' },
]

/* ─── Helpers ────────────────────────────────────────────────────── */
function getHeatColor(occupancy) {
  if (occupancy >= 70) return '#ef4444'
  if (occupancy >= 40) return '#f59e0b'
  return '#10b981'
}
function getOccupancyLabel(occupancy) {
  if (occupancy >= 80) return 'Très chargé'
  if (occupancy >= 60) return 'Animé'
  if (occupancy >= 30) return 'Calme'
  return 'Très calme'
}
const STALE_MS = 5 * 60 * 60 * 1000
function isStale(lastUpdated) {
  if (!lastUpdated) return true
  return Date.now() - new Date(lastUpdated).getTime() > STALE_MS
}
function formatTimeAgo(lastUpdated) {
  if (!lastUpdated) return null
  const diffMs  = Date.now() - new Date(lastUpdated).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1)  return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `Il y a ${diffH}h`
  return `Il y a ${Math.floor(diffH / 24)}j`
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
function PlaceholderImage({ type }) {
  const isCafe = type === 'Café'
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2
      ${isCafe
        ? 'bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100'
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'}`}>
      <span className="text-5xl select-none">{isCafe ? '☕' : '📚'}</span>
      <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
        {type ?? 'Lieu'}
      </span>
    </div>
  )
}

/* ─── Badge type ─────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  const isCafe = type === 'Café'
  const Icon = isCafe ? Coffee : BookOpen
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold
                      rounded-full px-2.5 py-0.5 border
      ${isCafe
        ? 'bg-amber-50 text-amber-700 border-amber-200/80'
        : 'bg-blue-50  text-blue-700  border-blue-200/80'}`}>
      <Icon size={11} strokeWidth={2} />
      {type ?? 'Lieu'}
    </span>
  )
}

/* ─── Vue : signalement ──────────────────────────────────────────── */
function ReportView({ lib, onConfirm, onBack }) {
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
      setSubmitError('Connexion impossible. Vérifie ta connexion et réessaie.')
      setSubmitting(false)
    }
  }

  return (
    <div className="px-5 pt-2 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} disabled={submitting}
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center
                     text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-40">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div>
          <h2 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
            {lib.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Signaler le niveau de fréquentation</p>
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
          <span className="text-sm text-slate-400">Sélectionne un niveau ci-dessus</span>
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
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: 'white',
          boxShadow: '0 8px 30px rgba(59,130,246,0.30), 0 2px 8px rgba(59,130,246,0.20)',
        } : {
          background: 'rgba(241,245,249,0.9)',
          color: '#94a3b8',
          cursor: 'not-allowed',
        }}
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Envoi en cours…
          </>
        ) : 'Confirmer le signalement'}
      </button>

      <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
        Ton signalement aide la communauté étudiante d'Amsterdam.
      </p>
    </div>
  )
}

/* ─── Vue : succès ───────────────────────────────────────────────── */
function SuccessView({ onClose }) {
  return (
    <div className="px-5 pt-6 pb-10 flex flex-col items-center text-center">
      <div className="check-pop w-20 h-20 rounded-full bg-emerald-50 flex items-center
                      justify-center mb-5 border-2 border-emerald-200">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path className="draw-check" d="M8 21 L17 30 L33 12"
                stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
        Merci pour ton aide !
      </h2>
      <p className="text-sm text-slate-500 mb-1">Ton signalement a été pris en compte.</p>
      <p className="text-xs text-slate-400 mb-2">La carte a été mise à jour en temps réel.</p>
      <p className="text-xs font-bold text-indigo-500 mb-8">+50 pts ajoutés à ton score ✨</p>
      <button onClick={onClose}
        className="px-8 py-3 rounded-2xl bg-slate-900 text-white
                   font-semibold text-sm hover:bg-slate-700 transition-colors">
        Retour à la carte
      </button>
    </div>
  )
}

/* ─── Panneau détail bibliothèque ────────────────────────────────── */
function LibrarySheet({ lib, onClose, onReport }) {
  const [view, setView] = useState('detail')
  useEffect(() => { setView('detail') }, [lib?.id])

  const color    = getHeatColor(lib.occupancy)
  const label    = getOccupancyLabel(lib.occupancy)
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
            <span className={`inline-flex items-center gap-1 text-xs font-medium
                              rounded-full px-2.5 py-0.5 border
              ${isStale(lib.lastUpdated)
                ? 'text-slate-400 bg-slate-50 border-slate-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
              {isStale(lib.lastUpdated)
                ? <Clock size={11} strokeWidth={2} />
                : <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
              {formatTimeAgo(lib.lastUpdated)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium
                             text-slate-400 bg-slate-50 border border-slate-200
                             rounded-full px-2.5 py-0.5">
              <Clock size={11} strokeWidth={2} /> Aucun signalement
            </span>
          )}
        </div>

        {/* Infos pratiques */}
        <div className="rounded-2xl overflow-hidden divide-y divide-slate-100/80 mb-4"
             style={{ background: 'rgba(248,250,252,0.85)', border: '1px solid rgba(226,232,240,0.7)' }}>

          {lib.address && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lib.address)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-start gap-3 px-4 py-3 hover:bg-slate-100/60 transition-colors">
              <MapPin size={14} className="mt-0.5 shrink-0 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Adresse</p>
                <p className="text-sm text-slate-700 leading-snug">{lib.address}</p>
              </div>
              <span className="text-slate-300 text-xs self-center shrink-0">↗</span>
            </a>
          )}

          {hours && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Clock size={14} className="shrink-0 text-blue-500" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Horaires</p>
                <p className="text-sm text-slate-700">{hours}</p>
              </div>
            </div>
          )}

          {lib.highlight && (
            <div className="flex items-start gap-3 px-4 py-3">
              <Star size={14} className="mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Points forts</p>
                <p className="text-sm text-slate-700 leading-snug">{lib.highlight}</p>
              </div>
            </div>
          )}
        </div>

        {/* Barre d'occupation */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-sm font-semibold text-slate-700">{lib.occupancy}% rempli</span>
            <span className="text-sm font-semibold" style={{ color }}>{label}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="h-2.5 rounded-full transition-all duration-500"
                 style={{ width: `${lib.occupancy}%`, background: color }} />
          </div>
          <div className="flex justify-between text-xs text-slate-300 mt-1">
            <span>Vide</span><span>Complet</span>
          </div>
        </div>

        {/* Bouton signalement */}
        <button
          onClick={canReport ? () => setView('report') : undefined}
          disabled={!canReport}
          className="w-full font-semibold text-base rounded-2xl py-4 transition-all duration-200"
          style={canReport ? {
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white',
            boxShadow: '0 8px 30px rgba(59,130,246,0.30), 0 2px 8px rgba(59,130,246,0.20)',
          } : {
            background: 'rgba(241,245,249,0.9)',
            color: '#94a3b8',
            cursor: 'not-allowed',
          }}
        >
          {canReport ? 'Signaler le niveau de place' : '🔒 Lieu fermé — pas de signalement'}
        </button>

      </div>
    </div>
  )
}

/* ─── App root (avec UserProvider) ──────────────────────────────── */
export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
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
                      justify-center gap-3 bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Chargement des spots…</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full max-w-lg mx-auto overflow-hidden bg-slate-50">

      {/* Bannière démo — local uniquement */}
      {showBanner && (
        <div className="absolute top-0 left-0 right-0 z-[1002] bg-amber-400/90
                        backdrop-blur-sm text-amber-900 text-xs font-medium
                        text-center py-1.5 px-4">
          ⚠️ Mode démo — configure <code className="font-mono">.env</code> pour connecter Airtable
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
