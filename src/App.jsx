import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, Users, UsersRound, Users2 } from 'lucide-react'
import Map from './components/Map'
import LibraryList from './components/LibraryList'
import { useStudySpots } from './hooks/useStudySpots'

/* ─── Config de notation ────────────────────────────────────────── */
const RATINGS = [
  { value: 1, label: 'Vide',        color: '#10b981', occupancy: 10 },
  { value: 2, label: 'Calme',       color: '#6ee7b7', occupancy: 30 },
  { value: 3, label: 'Modéré',      color: '#fbbf24', occupancy: 55 },
  { value: 4, label: 'Très occupé', color: '#f59e0b', occupancy: 75 },
  { value: 5, label: 'Complet',     color: '#ef4444', occupancy: 95 },
]

/* ─── Helpers ───────────────────────────────────────────────────── */
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

const STALE_MS = 5 * 60 * 60 * 1000  // 5 heures

function isStale(lastUpdated) {
  if (!lastUpdated) return true
  return Date.now() - new Date(lastUpdated).getTime() > STALE_MS
}

function formatTimeAgo(lastUpdated) {
  if (!lastUpdated) return null
  const diffMs  = Date.now() - new Date(lastUpdated).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1)  return 'À l\'instant'
  if (diffMin < 60) return `Il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `Il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `Il y a ${diffD}j`
}

/* ─── Icônes de densité ─────────────────────────────────────────── */
// Progression cohérente dans la même famille d'icônes :
// 1 → UserRound  2 → Users  3 → UsersRound  4 → Users2  5 → Users2 + badge "+"
function CrowdLevelIcon({ value, color, size = 28 }) {
  const props = { size, color, strokeWidth: 2 }

  /* Note 5 : Users2 + badge "+" pour signifier le débordement */
  if (value === 5) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Users2 {...props} strokeWidth={2.5} />
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
                     flex items-center justify-center text-white font-black"
          style={{ background: color, fontSize: '9px', lineHeight: 1 }}
        >
          +
        </span>
      </div>
    )
  }

  /* Notes 1–4 : même famille visuelle, densité croissante */
  const IconMap = { 1: UserRound, 2: Users, 3: UsersRound, 4: Users2 }
  const Icon = IconMap[value]
  return <Icon {...props} />
}

/* ─── Vue : formulaire de signalement ──────────────────────────── */
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
      await onConfirm(rating) // le parent switch vers 'success' si succès
    } catch {
      setSubmitError('Connexion impossible. Vérifie ta connexion et réessaie.')
      setSubmitting(false)
    }
  }

  return (
    <div className="px-5 pt-2 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} disabled={submitting}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                     text-gray-500 hover:text-gray-800 transition-colors text-sm
                     disabled:opacity-40">
          ←
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-base leading-tight">{lib.name}</h2>
          <p className="text-xs text-gray-400">Signaler le niveau de place</p>
        </div>
      </div>

      {/* Échelle 1–5 */}
      <div className="flex justify-between gap-1 mb-3">
        {RATINGS.map((r) => {
          const isSelected = rating === r.value
          const isActive   = rating !== null && r.value <= rating

          return (
            <button
              key={r.value}
              onClick={() => { setRating(r.value); setSubmitError(null) }}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl
                         transition-all duration-200 focus:outline-none disabled:opacity-50"
              style={{
                background: isSelected ? r.color + '22' : 'transparent',
                transform:  isSelected ? 'scale(1.15)' : 'scale(1)',
                border: isSelected ? `1.5px solid ${r.color}55` : '1.5px solid transparent',
              }}
            >
              <div
                className="transition-all duration-200"
                style={{
                  filter: isSelected ? `drop-shadow(0 0 5px ${r.color})` : 'none',
                  opacity: !isActive && rating !== null ? 0.3 : 1,
                }}
              >
                <CrowdLevelIcon
                  value={r.value}
                  color={isActive ? r.color : '#d1d5db'}
                  size={28}
                />
              </div>
              <span
                className="text-xs font-bold transition-colors duration-200"
                style={{ color: isActive ? r.color : '#9ca3af' }}
              >
                {r.value}
              </span>
            </button>
          )
        })}
      </div>

      {/* Label dynamique */}
      <div className="h-7 flex items-center justify-center mb-5">
        {selected ? (
          <span
            className="text-sm font-semibold px-3 py-1 rounded-full transition-all"
            style={{ color: selected.color, background: selected.color + '18' }}
          >
            {selected.value}/5 — {selected.label}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Sélectionne un niveau ci-dessus</span>
        )}
      </div>

      {/* Message d'erreur */}
      {submitError && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200
                        flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <p className="text-sm text-red-600 font-medium">{submitError}</p>
        </div>
      )}

      {/* Bouton confirmer */}
      <button
        disabled={!rating || submitting}
        onClick={handleConfirm}
        className={`w-full font-semibold text-base rounded-2xl py-4 transition-all duration-200
          flex items-center justify-center gap-2
          ${rating && !submitting
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-200'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white
                             animate-spin inline-block" />
            Envoi en cours…
          </>
        ) : (
          'Confirmer le signalement'
        )}
      </button>

      {/* Mention communauté */}
      <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
        Votre signalement aide la communauté étudiante d'Amsterdam.
      </p>
    </div>
  )
}

/* ─── Vue : succès ──────────────────────────────────────────────── */
function SuccessView({ onClose }) {
  return (
    <div className="px-5 pt-6 pb-10 flex flex-col items-center text-center">
      {/* Cercle avec coche animée */}
      <div className="check-pop w-20 h-20 rounded-full bg-green-50 flex items-center
                      justify-center mb-5 border-2 border-green-200">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            className="draw-check"
            d="M8 21 L17 30 L33 12"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Merci pour ton aide&nbsp;!
      </h2>
      <p className="text-sm text-gray-500 mb-1">
        Ton signalement a été pris en compte.
      </p>
      <p className="text-xs text-gray-400 mb-8">
        La carte a été mise à jour en temps réel.
      </p>

      <button
        onClick={onClose}
        className="px-8 py-3 rounded-2xl bg-gray-900 text-white
                   font-semibold text-sm hover:bg-gray-700 transition-colors"
      >
        Retour à la carte
      </button>
    </div>
  )
}

/* ─── Panneau principal bibliothèque ────────────────────────────── */
function LibrarySheet({ lib, onClose, onReport }) {
  const [view, setView] = useState('detail') // 'detail' | 'report' | 'success'

  // Reset à chaque nouvelle bibliothèque sélectionnée
  useEffect(() => {
    setView('detail')
  }, [lib?.id])

  const color = getHeatColor(lib.occupancy)
  const label = getOccupancyLabel(lib.occupancy)

  if (view === 'success') {
    return <SuccessView onClose={onClose} />
  }

  if (view === 'report') {
    return (
      <ReportView
        lib={lib}
        onBack={() => setView('detail')}
        onConfirm={async (rating) => {
          await onReport(lib.id, rating) // lève une erreur si Airtable KO
          setView('success')
        }}
      />
    )
  }

  /* Vue détail */
  return (
    <div className="px-5 pt-3 pb-8">
      {/* Bouton fermeture */}
      <div className="relative flex justify-center mb-4">
        <button
          onClick={onClose}
          className="absolute right-0 top-1/2 -translate-y-1/2
                     w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                     text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-900 leading-tight">{lib.name}</h2>
      <p className="text-sm text-gray-400 mt-1">{lib.address}</p>

      {/* Badges fraîcheur + signalement récent */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {lib.lastUpdated ? (
          <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5
            ${isStale(lib.lastUpdated)
              ? 'text-gray-400 bg-gray-100 border border-gray-200'
              : 'text-green-700 bg-green-50 border border-green-200'
            }`}>
            <span>{isStale(lib.lastUpdated) ? '🕐' : '🟢'}</span>
            {formatTimeAgo(lib.lastUpdated)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400
                           bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5">
            🕐 Aucun signalement
          </span>
        )}
        {lib.recentReport && !isStale(lib.lastUpdated) && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600
                           bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            ⚡ Signalement récent
          </span>
        )}
      </div>

      {/* Indicateur de remplissage */}
      <div className="mt-5">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm font-semibold text-gray-700">
            {lib.occupancy}% rempli
          </span>
          <span className="text-sm font-medium" style={{ color }}>
            {label}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${lib.occupancy}%`, background: color }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>Vide</span>
          <span>Complet</span>
        </div>
      </div>

      {/* Bouton vers le formulaire */}
      <button
        onClick={() => setView('report')}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                   text-white font-semibold text-base rounded-2xl py-4
                   transition-colors shadow-md shadow-blue-200"
      >
        Signaler le niveau de place
      </button>
    </div>
  )
}

/* ─── App ───────────────────────────────────────────────────────── */
export default function App() {
  const { libraries, loading, error, isMock, report } = useStudySpots()
  const [showList, setShowList]       = useState(false)
  const [selectedLib, setSelectedLib] = useState(null)

  // Sync selectedLib quand les données Airtable arrivent / sont mises à jour
  useEffect(() => {
    if (!selectedLib) return
    const updated = libraries.find((l) => l.id === selectedLib.id)
    if (updated) setSelectedLib(updated)
  }, [libraries])

  function handleSelectLib(lib) {
    setShowList(false)
    setSelectedLib(lib)
  }

  async function handleReport(libId, rating) {
    await report(libId, rating)
  }

  /* ── Écran de chargement ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="h-screen w-full max-w-lg mx-auto flex flex-col items-center
                      justify-center gap-3 bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent
                        animate-spin" />
        <p className="text-sm text-gray-400">Chargement des spots…</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full max-w-lg mx-auto overflow-hidden bg-gray-100">

      {/* Carte plein écran */}
      <div className="absolute inset-0">
        <Map libraries={libraries} onSelect={handleSelectLib} />
      </div>

      {/* Bannière mode démo — uniquement en développement local */}
      {isMock && import.meta.env.DEV && (
        <div className="absolute top-0 left-0 right-0 z-[1002] bg-amber-400/90
                        backdrop-blur-sm text-amber-900 text-xs font-medium
                        text-center py-1.5 px-4">
          ⚠️ Mode démo — configure <code className="font-mono">.env</code> pour connecter Airtable
        </div>
      )}

      {/* Barre flottante */}
      <nav className={`absolute left-4 right-4 z-[1000] flex items-center justify-between
                      bg-white/60 backdrop-blur-md rounded-2xl px-5 py-3
                      shadow-lg border border-white/50
                      ${isMock ? 'top-10' : 'top-4'}`}>
        <div>
          <h1 className="font-bold text-gray-900 text-lg tracking-tight leading-none">
            StudySpot AMS
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{libraries.length} lieux</p>
        </div>
        <button
          onClick={() => { setShowList((v) => !v); setSelectedLib(null) }}
          className="px-4 py-1.5 rounded-full text-sm font-semibold
                     bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          {showList ? '✕ Fermer' : '☰ Liste'}
        </button>
      </nav>

      {/* ── Panneau liste ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showList && !selectedLib && (
          <motion.div
            key="list-sheet"
            className="absolute bottom-0 left-0 right-0 z-[1000]
                       bg-white/90 backdrop-blur-md rounded-t-3xl shadow-2xl
                       max-h-[65vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) setShowList(false)
            }}
          >
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <LibraryList libraries={libraries} onSelect={handleSelectLib} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom sheet détail + signalement ─────────────────────── */}
      <AnimatePresence>
        {selectedLib && (
          <>
            {/* Fond semi-transparent cliquable */}
            <motion.div
              key="backdrop"
              className="absolute inset-0 z-[1000] bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedLib(null)}
            />

            <motion.div
              key="detail-sheet"
              className="absolute bottom-0 left-0 right-0 z-[1001]
                         bg-white rounded-t-3xl shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setSelectedLib(null)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Poignée drag visible */}
              <div className="flex justify-center pt-3 pb-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

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
