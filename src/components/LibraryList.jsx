import { isLibOpen } from '../utils/time'

/* ── Helpers ──────────────────────────────────────────────────────── */
function getOccupancyBadge(occupancy) {
  if (occupancy >= 80) return { label: 'Très chargé', bg: '#fee2e2', color: '#ef4444' }
  if (occupancy >= 55) return { label: 'Animé',       bg: '#ffedd5', color: '#f97316' }
  if (occupancy >= 30) return { label: 'Calme',       bg: '#fef9c3', color: '#ca8a04' }
  return                      { label: 'Vide',        bg: '#d1fae5', color: '#10b981' }
}

/* ── Placeholder miniature ───────────────────────────────────────── */
function Thumbnail({ imageUrl, type, name }) {
  const isCafe = type === 'Café'
  if (imageUrl) {
    return (
      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
        {/* fallback si image cassée */}
        <div className="absolute inset-0 hidden items-center justify-center text-2xl"
             style={{ background: isCafe
               ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
               : 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
          {isCafe ? '☕' : '📚'}
        </div>
      </div>
    )
  }
  return (
    <div className="w-20 h-20 shrink-0 rounded-xl flex items-center justify-center text-2xl"
         style={{ background: isCafe
           ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
           : 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
      {isCafe ? '☕' : '📚'}
    </div>
  )
}

/* ── Composant principal ─────────────────────────────────────────── */
export default function LibraryList({ libraries = [], onSelect }) {
  if (libraries.length === 0) {
    return (
      <p className="text-center text-slate-400 py-10 font-medium">
        Aucun lieu trouvé.
      </p>
    )
  }

  return (
    <div className="px-4 pb-6 pt-2">
      {/* Titre section */}
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">
        {libraries.length} lieux disponibles
      </p>

      <div className="space-y-3">
        {libraries.map((lib) => {
          const badge     = getOccupancyBadge(lib.occupancy ?? 50)
          const openState = isLibOpen(lib.openingTime, lib.closingTime)
          // openState: true = ouvert, false = fermé, null = inconnu

          return (
            <button
              key={lib.id}
              onClick={() => onSelect?.(lib)}
              className="w-full text-left transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 bg-white rounded-2xl p-3
                              shadow-sm hover:shadow-md transition-shadow"
                   style={{ border: '1px solid rgba(226,232,240,0.8)' }}>

                {/* Miniature */}
                <Thumbnail imageUrl={lib.imageUrl} type={lib.type} name={lib.name} />

                {/* Infos */}
                <div className="flex-1 min-w-0">

                  {/* Nom + dot ouvert/fermé */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {openState !== null && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        openState ? 'bg-emerald-500' : 'bg-red-400'
                      }`} />
                    )}
                    <p className="font-bold text-slate-800 truncate text-sm leading-tight">
                      {lib.name}
                    </p>
                  </div>

                  {/* Adresse */}
                  {lib.address && (
                    <p className="text-xs text-slate-400 truncate mb-2 leading-tight">
                      {lib.address}
                    </p>
                  )}

                  {/* Badge occupation + distance simulée */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                          style={{ background: badge.bg, color: badge.color }}>
                      {lib.occupancy}% — {badge.label}
                    </span>
                    {/* Distance simulée selon l'ordre */}
                    <span className="text-xs text-slate-300 font-medium">
                      • Amsterdam
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"
                     strokeLinejoin="round" className="shrink-0">
                  <path d="M9 18l6-6-6-6"/>
                </svg>

              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
