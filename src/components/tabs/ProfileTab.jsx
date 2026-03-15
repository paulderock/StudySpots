import { useUser } from '../../context/UserContext'

/* ── Barre de progression vers le niveau suivant ─────────────── */
function ProgressBar({ score, nextLevel }) {
  if (!nextLevel) return null
  const prevLevel = score >= 1000 ? 1000 : score >= 500 ? 500 : score >= 100 ? 100 : 0
  const pct = Math.min(((score - prevLevel) / (nextLevel - prevLevel)) * 100, 100)
  return (
    <div className="w-full bg-indigo-100/60 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
        }}
      />
    </div>
  )
}

const SETTINGS = [
  { icon: '🔔', label: 'Notifications',   value: 'Activées' },
  { icon: '🌙', label: 'Mode sombre',      value: 'Bientôt'  },
  { icon: '🗺️', label: 'Rayon de recherche', value: 'Amsterdam' },
  { icon: '🔒', label: 'Confidentialité', value: '›'        },
  { icon: '💬', label: 'Nous contacter',  value: '›'        },
]

export default function ProfileTab() {
  const { user, badge } = useUser()

  return (
    <div
      className="absolute inset-0 overflow-y-auto bg-slate-50 pb-36"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* ── Hero profil ──────────────────────────────────────── */}
      <div
        className="bg-white pt-14 pb-6 px-5 mb-3"
        style={{ borderBottom: '1px solid rgba(226,232,240,0.7)' }}
      >
        {/* Avatar + nom */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center
                       shadow-md shrink-0"
            style={{
              background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.15)',
            }}
          >
            <span className="text-2xl font-black text-indigo-600">
              {user.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-lg tracking-tight leading-tight">
              {user.fullName}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-base">{badge.emoji}</span>
              <span
                className="text-xs font-bold rounded-full px-2.5 py-0.5"
                style={{ background: badge.color + '18', color: badge.color }}
              >
                {badge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Carte score */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
            border: '1px solid rgba(99,102,241,0.12)',
          }}
        >
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
                Score total
              </p>
              <p className="text-3xl font-black text-indigo-700 leading-none">
                {user.score.toLocaleString('fr-FR')}
                <span className="text-sm font-semibold ml-1 text-indigo-400">pts</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-500 font-semibold">
                {user.reports} signalement{user.reports !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-indigo-300 mt-0.5">+50 pts par rapport</p>
            </div>
          </div>

          {badge.next ? (
            <>
              <ProgressBar score={user.score} nextLevel={badge.next} />
              <p className="text-xs text-indigo-400 mt-1.5">
                {badge.next - user.score} pts pour atteindre le niveau suivant
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-amber-500">
              🏆 Niveau maximum atteint !
            </p>
          )}
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Signalements', value: user.reports,  emoji: '📍' },
            { label: 'Score',        value: user.score,    emoji: '⭐' },
            { label: 'Niveau',       value: badge.label,   emoji: badge.emoji },
          ].map(s => (
            <div
              key={s.label}
              className="bg-slate-50 rounded-xl p-3 text-center"
              style={{ border: '1px solid rgba(226,232,240,0.8)' }}
            >
              <p className="text-lg mb-1">{s.emoji}</p>
              <p className="font-bold text-slate-800 text-sm leading-none truncate">
                {s.value}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comment gagner des points ─────────────────────────── */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
          Comment progresser
        </p>
        <div
          className="bg-white rounded-2xl p-4 space-y-3"
          style={{ border: '1px solid rgba(226,232,240,0.7)' }}
        >
          {[
            { icon: '📍', action: 'Signaler un niveau de fréquentation', pts: '+50 pts' },
            { icon: '🔥', action: 'Signaler 5 fois en une journée',       pts: 'Bientôt' },
            { icon: '⭐', action: 'Être le premier à signaler',           pts: 'Bientôt' },
          ].map(r => (
            <div key={r.action} className="flex items-center gap-3">
              <span className="text-xl">{r.icon}</span>
              <span className="flex-1 text-sm text-slate-600 font-medium">{r.action}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#f0fdf4', color: '#16a34a' }}
              >
                {r.pts}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Paramètres ───────────────────────────────────────── */}
      <div className="px-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
          Paramètres
        </p>
        <div
          className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-100"
          style={{ border: '1px solid rgba(226,232,240,0.7)' }}
        >
          {SETTINGS.map(s => (
            <button
              key={s.label}
              className="w-full flex items-center gap-3 px-4 py-3.5
                         hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-base">{s.icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-700">{s.label}</span>
              <span className="text-xs text-slate-400 font-medium">{s.value}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-300 mt-6 font-medium">
          StudySpot AMS · v1.0
        </p>
        <p className="text-center text-xs text-slate-300 mt-1">
          Made with ❤️ in Amsterdam
        </p>
      </div>
    </div>
  )
}
