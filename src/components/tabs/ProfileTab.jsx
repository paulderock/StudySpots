import { useState } from 'react'
import {
  MapPin, Zap, Star, ChevronRight, Bell, Moon, Lock,
  MessageSquare, Shield, Trash2, BookOpen, Clock, Sun,
  LogOut, Bug, HelpCircle, Sunrise, Flame, Moon as MoonIcon,
  Info, User, Globe,
} from 'lucide-react'
import { useUser, getBadge } from '../../context/UserContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

/* ── Barre de progression ──────────────────────────────────────── */
function ProgressBar({ score, badge }) {
  if (!badge.next) return null
  const pct = Math.min(((score - badge.prev) / (badge.next - badge.prev)) * 100, 100)
  return (
    <div className="w-full bg-white/40 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#3b82f6)' }}
      />
    </div>
  )
}

/* ── Bloc section settings ─────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="px-5 mb-4">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
        {title}
      </p>
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-50"
           style={{ border: '1px solid rgba(226,232,240,0.7)' }}>
        {children}
      </div>
    </div>
  )
}

/* ── Ligne settings ────────────────────────────────────────────── */
function Row({ icon: Icon, label, value, danger, onClick, toggle, toggled, iconColor }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3
                  hover:bg-slate-50/80 transition-colors text-left`}
    >
      <span className="w-6 flex items-center justify-center shrink-0">
        <Icon size={15} strokeWidth={2}
              style={{ color: danger ? '#ef4444' : iconColor ?? '#64748b' }} />
      </span>
      <span className={`flex-1 text-sm font-medium ${danger ? 'text-red-500' : 'text-slate-700'}`}>
        {label}
      </span>
      {toggle ? (
        <div
          className="w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5"
          style={{ background: toggled ? '#3b82f6' : '#e2e8f0' }}
        >
          <div
            className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: toggled ? 'translateX(16px)' : 'translateX(0)' }}
          />
        </div>
      ) : value ? (
        <span className="text-xs text-slate-400 font-medium">{value}</span>
      ) : (
        <ChevronRight size={14} strokeWidth={2} className="text-slate-300 shrink-0" />
      )}
    </button>
  )
}

/* ── Badge locked/unlocked ─────────────────────────────────────── */
function AchievementBadge({ icon: Icon, label, unlocked, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: unlocked ? `${color}18` : '#f1f5f9',
          border: unlocked ? `1.5px solid ${color}30` : '1.5px solid #e2e8f0',
        }}
      >
        <Icon size={22} strokeWidth={1.8}
              style={{ color: unlocked ? color : '#cbd5e1' }} />
      </div>
      <span className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] ${
        unlocked ? 'text-slate-700' : 'text-slate-400'
      }`}>
        {label}
      </span>
    </div>
  )
}

/* ── Composant principal ───────────────────────────────────────── */
export default function ProfileTab() {
  const { user, badge, resetUser } = useUser()
  const { user: authUser, signOut } = useAuth()
  const { lang, setLanguage, t } = useLanguage()
  const [locationShare, setLocationShare] = useState(false)
  const [pendingLang,   setPendingLang]   = useState(lang)

  // Surcharge email et prénom depuis Supabase si dispo
  const displayEmail    = authUser?.email ?? user.email
  const displayName     = authUser?.user_metadata?.first_name ?? user.name
  const displayFullName = authUser
    ? (authUser.user_metadata?.first_name ?? authUser.email?.split('@')[0] ?? user.fullName)
    : user.fullName

  /* badges débloqués selon reports */
  const earlyBird  = false              // nécessiterait timestamp horaire
  const onFire     = user.reports >= 3
  const nightOwl   = false              // idem

  function maskEmail(email) {
    const [local, domain] = email.split('@')
    return local.slice(0, 2) + '••••@' + domain
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(t('dateLocale'), { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatTimeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000
    if (diff < 60)    return t('justNow')
    if (diff < 3600)  return t('minutesAgo', Math.floor(diff/60))
    if (diff < 86400) return t('hoursAgo', Math.floor(diff/3600))
    return t('daysAgo', Math.floor(diff/86400))
  }

  return (
    <div className="absolute inset-0 overflow-y-auto bg-slate-50 pb-36"
         style={{ scrollbarWidth: 'none' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="bg-white pt-14 pb-5 px-5 mb-3"
           style={{ borderBottom: '1px solid rgba(226,232,240,0.7)' }}>

        {/* Avatar + nom */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md shrink-0"
               style={{
                 background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                 boxShadow: '0 8px 24px rgba(99,102,241,0.15)',
               }}>
            <span className="text-2xl font-black text-indigo-600">
              {user.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-lg tracking-tight leading-tight">
              {user.fullName}
            </h1>
            <span
              className="inline-block text-xs font-bold rounded-full px-2.5 py-0.5 mt-1.5"
              style={{ background: badge.color + '18', color: badge.color }}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Carte score */}
        <div className="rounded-2xl p-4 mb-4"
             style={{
               background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
               border: '1px solid rgba(99,102,241,0.12)',
             }}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
                {t('totalScore')}
              </p>
              <p className="text-3xl font-black text-indigo-700 leading-none">
                {user.score.toLocaleString('fr-FR')}
                <span className="text-sm font-semibold ml-1 text-indigo-400">{t('pts')}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-500 font-semibold">{t('reportsCount', user.reports)}</p>
              <p className="text-xs text-indigo-300 mt-0.5">{t('ptsPerReport')}</p>
            </div>
          </div>
          {badge.next ? (
            <>
              <ProgressBar score={user.score} badge={badge} />
              <p className="text-xs text-indigo-400 mt-1.5">
                {t('ptsUntil', badge.next - user.score, getBadge(badge.next).label)}
              </p>
            </>
          ) : (
            <p className="text-xs font-bold text-amber-500">{t('maxLevel')}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t('statReports'), value: user.reports,  Icon: MapPin,  color: '#6366f1' },
            { label: t('statScore'),   value: user.score,    Icon: Star,    color: '#f59e0b' },
            { label: t('statLevel'),   value: badge.label,   Icon: Zap,     color: badge.color },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center"
                 style={{ border: '1px solid rgba(226,232,240,0.8)' }}>
              <s.Icon size={16} strokeWidth={2} className="mx-auto mb-1.5"
                      style={{ color: s.color }} />
              <p className="font-bold text-slate-800 text-sm leading-none truncate">{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activités récentes ────────────────────────────────────── */}
      {user.recentActivity?.length > 0 && (
        <div className="px-5 mb-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
            {t('recentActivity')}
          </p>
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-50"
               style={{ border: '1px solid rgba(226,232,240,0.7)' }}>
            {user.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <MapPin size={12} strokeWidth={2} className="text-green-500" />
                </div>
                <span className="flex-1 text-sm text-slate-600 font-medium">{a.label}</span>
                <span className="text-xs font-bold text-green-600">{a.pts}</span>
                <span className="text-[10px] text-slate-400 ml-1">{formatTimeAgo(a.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges ───────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
          {t('badges')}
        </p>
        <div className="bg-white rounded-2xl p-4"
             style={{ border: '1px solid rgba(226,232,240,0.7)' }}>
          <div className="flex justify-around">
            <AchievementBadge icon={Sunrise} label={t('badgeEarlyBird')} unlocked={earlyBird} color="#f59e0b" />
            <AchievementBadge icon={Flame}   label={t('badgeOnFire')}   unlocked={onFire}    color="#ef4444" />
            <AchievementBadge icon={MoonIcon} label={t('badgeNightOwl')} unlocked={nightOwl} color="#6366f1" />
            <AchievementBadge icon={MapPin}  label={t('badgeExplorer')} unlocked={user.reports >= 1} color="#10b981" />
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
            {t('badgesUnlocked', [earlyBird, onFire, nightOwl, user.reports >= 1].filter(Boolean).length)}
          </p>
        </div>
      </div>

      {/* ── Comment progresser ───────────────────────────────────── */}
      <Section title={t('howToProgress')}>
        <Row icon={MapPin}  label={t('actionReport')} value="+50 pts"          iconColor="#6366f1" />
        <Row icon={Flame}   label={t('actionStreak')} value={t('comingSoon')}  iconColor="#ef4444" />
        <Row icon={Star}    label={t('actionFirst')}  value={t('comingSoon')}  iconColor="#f59e0b" />
      </Section>

      {/* ── Mon Compte ───────────────────────────────────────────── */}
      <Section title={t('myAccount')}>
        <Row icon={User}    label={t('emailLabel')}    value={maskEmail(displayEmail)} />
        <Row icon={Clock}   label={t('memberSince')}   value={formatDate(user.joinedAt)} />
        <Row icon={Lock}    label={t('passwordLabel')} />
      </Section>

      {/* ── Préférences langue ───────────────────────────────────── */}
      <Section title={t('preferences')}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} strokeWidth={2} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">{t('languageLabel')}</span>
          </div>
          <div className="flex gap-2 mb-3">
            {[{ code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => setPendingLang(code)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={pendingLang === code ? {
                  background: '#0f172a', color: '#fff',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
                } : {
                  background: '#f8fafc', color: '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span>{flag}</span> {label}
              </button>
            ))}
          </div>
          {pendingLang !== lang && (
            <button
              onClick={() => setLanguage(pendingLang)}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}
            >
              {t('confirmBtn')}
            </button>
          )}
        </div>
      </Section>

      {/* ── Confidentialité ──────────────────────────────────────── */}
      <Section title={t('privacyData')}>
        <Row
          icon={Shield}
          label={t('shareLocation')}
          toggle
          toggled={locationShare}
          onClick={() => setLocationShare(v => !v)}
        />
        <Row icon={Trash2} label={t('deleteAccount')} danger />
      </Section>

      {/* ── Support ──────────────────────────────────────────────── */}
      <Section title={t('supportInfo')}>
        <Row icon={Info}         label={t('appVersion')} value="v1.0.4" />
        <Row icon={Bug}          label={t('reportBug')}  />
        <Row icon={HelpCircle}   label={t('helpFaq')}    />
      </Section>

      {/* ── Déconnexion ──────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <button
          onClick={() => { resetUser(); signOut() }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                     bg-red-50 text-red-500 font-semibold text-sm
                     border border-red-100 hover:bg-red-100 transition-colors active:scale-[0.98]"
        >
          <LogOut size={16} strokeWidth={2} />
          {t('logout')}
        </button>
      </div>

      <p className="text-center text-xs text-slate-300 pb-4 font-medium">{t('footer')}</p>
    </div>
  )
}
