import { useState } from 'react'
import {
  MapPin, Zap, Star, ChevronRight, Lock,
  Shield, Trash2, Clock,
  LogOut, Bug, HelpCircle, Sunrise, Flame, Moon as MoonIcon,
  Info, User, Globe,
} from 'lucide-react'
import { useUser, getBadge } from '../../context/UserContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

/* ── Palette ──────────────────────────────────────────────────── */
const MINT         = '#8AD1C2'
const FOREST_LIGHT = '#4FA095'
const FOREST_DEEP  = '#153462'
const CREAM        = '#F6F6C9'

/* ── Barre de progression ─────────────────────────────────────── */
function ProgressBar({ score, badge }) {
  if (!badge.next) return null
  const pct = Math.min(((score - badge.prev) / (badge.next - badge.prev)) * 100, 100)
  return (
    <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
      <div className="h-1.5 rounded-full transition-all duration-700"
           style={{ width: `${pct}%`, background: `linear-gradient(90deg,${MINT},${FOREST_LIGHT})` }} />
    </div>
  )
}

/* ── Section ──────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="px-5 mb-4">
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1"
         style={{ color: FOREST_LIGHT }}>
        {title}
      </p>
      <div className="bg-white rounded-2xl overflow-hidden divide-y"
           style={{ border: `1px solid rgba(79,160,149,0.18)`, divideColor: `rgba(79,160,149,0.08)` }}>
        {children}
      </div>
    </div>
  )
}

/* ── Row ──────────────────────────────────────────────────────── */
function Row({ icon: Icon, label, value, danger, onClick, toggle, toggled, iconColor }) {
  return (
    <button onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors text-left">
      <span className="w-6 flex items-center justify-center shrink-0">
        <Icon size={15} strokeWidth={2}
              style={{ color: danger ? '#ef4444' : iconColor ?? FOREST_LIGHT }} />
      </span>
      <span className={`flex-1 text-sm font-medium ${danger ? 'text-red-500' : 'text-slate-700'}`}>
        {label}
      </span>
      {toggle ? (
        <div className="w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5"
             style={{ background: toggled ? FOREST_LIGHT : '#e2e8f0' }}>
          <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
               style={{ transform: toggled ? 'translateX(16px)' : 'translateX(0)' }} />
        </div>
      ) : value ? (
        <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{value}</span>
      ) : (
        <ChevronRight size={14} strokeWidth={2} style={{ color: `rgba(79,160,149,0.40)` }} className="shrink-0" />
      )}
    </button>
  )
}

/* ── Badge achievement ────────────────────────────────────────── */
function AchievementBadge({ icon: Icon, label, unlocked, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
           style={{
             background: unlocked ? `${color}18` : '#f1f5f9',
             border: unlocked ? `1.5px solid ${color}40` : '1.5px solid #e2e8f0',
           }}>
        <Icon size={22} strokeWidth={1.8} style={{ color: unlocked ? color : '#cbd5e1' }} />
      </div>
      <span className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] ${
        unlocked ? 'text-slate-700' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────────── */
export default function ProfileTab() {
  const { user, badge, resetUser } = useUser()
  const { user: authUser, signOut } = useAuth()
  const { lang, setLanguage, t } = useLanguage()
  const [locationShare, setLocationShare] = useState(false)
  const [pendingLang,   setPendingLang]   = useState(lang)

  const displayEmail = authUser?.email ?? user.email
  const earlyBird = false
  const onFire    = user.reports >= 3
  const nightOwl  = false

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
    <div className="absolute inset-0 overflow-y-auto pb-36"
         style={{ background: '#f2f6f5', scrollbarWidth: 'none' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="pt-14 pb-5 px-5 mb-3"
           style={{ background: '#fff', borderBottom: `1px solid rgba(79,160,149,0.15)` }}>

        {/* Avatar + nom */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md shrink-0"
               style={{
                 background: `linear-gradient(135deg, ${MINT}40, ${FOREST_LIGHT}30)`,
                 boxShadow: `0 8px 24px rgba(79,160,149,0.20)`,
                 border: `2px solid rgba(138,209,194,0.40)`,
               }}>
            <span className="text-2xl font-black" style={{ color: FOREST_DEEP }}>
              {user.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-tight" style={{ color: FOREST_DEEP }}>
              {user.fullName}
            </h1>
            <span className="inline-block text-xs font-bold rounded-full px-2.5 py-0.5 mt-1.5"
                  style={{ background: `${MINT}22`, color: FOREST_LIGHT }}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Carte score */}
        <div className="rounded-2xl p-4 mb-4"
             style={{
               background: `linear-gradient(135deg, ${FOREST_DEEP} 0%, #1e4a7a 50%, ${FOREST_LIGHT} 100%)`,
               border: `1px solid rgba(138,209,194,0.20)`,
               boxShadow: `0 8px 24px rgba(21,52,98,0.25)`,
             }}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                 style={{ color: `rgba(138,209,194,0.80)` }}>{t('totalScore')}</p>
              <p className="text-3xl font-black leading-none" style={{ color: CREAM }}>
                {user.score.toLocaleString('fr-FR')}
                <span className="text-sm font-semibold ml-1" style={{ color: MINT }}>{t('pts')}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: MINT }}>{t('reportsCount', user.reports)}</p>
              <p className="text-xs mt-0.5" style={{ color: `rgba(246,246,201,0.50)` }}>{t('ptsPerReport')}</p>
            </div>
          </div>
          {badge.next ? (
            <>
              <ProgressBar score={user.score} badge={badge} />
              <p className="text-xs mt-1.5" style={{ color: `rgba(246,246,201,0.60)` }}>
                {t('ptsUntil', badge.next - user.score, getBadge(badge.next).label)}
              </p>
            </>
          ) : (
            <p className="text-xs font-bold" style={{ color: CREAM }}>{t('maxLevel')}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t('statReports'), value: user.reports, Icon: MapPin, color: FOREST_LIGHT },
            { label: t('statScore'),   value: user.score,   Icon: Star,   color: '#f59e0b'    },
            { label: t('statLevel'),   value: badge.label,  Icon: Zap,    color: MINT         },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center"
                 style={{ background: '#f2f6f5', border: `1px solid rgba(79,160,149,0.15)` }}>
              <s.Icon size={16} strokeWidth={2} className="mx-auto mb-1.5" style={{ color: s.color }} />
              <p className="font-bold text-sm leading-none truncate" style={{ color: FOREST_DEEP }}>{s.value}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#94a3b8' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activités récentes ────────────────────────────────────── */}
      {user.recentActivity?.length > 0 && (
        <div className="px-5 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1"
             style={{ color: FOREST_LIGHT }}>{t('recentActivity')}</p>
          <div className="bg-white rounded-2xl overflow-hidden divide-y"
               style={{ border: `1px solid rgba(79,160,149,0.18)` }}>
            {user.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: `rgba(138,209,194,0.15)` }}>
                  <MapPin size={12} strokeWidth={2} style={{ color: FOREST_LIGHT }} />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-600">{a.label}</span>
                <span className="text-xs font-bold" style={{ color: FOREST_LIGHT }}>{a.pts}</span>
                <span className="text-[10px] text-slate-400 ml-1">{formatTimeAgo(a.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges ───────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1"
           style={{ color: FOREST_LIGHT }}>{t('badges')}</p>
        <div className="bg-white rounded-2xl p-4"
             style={{ border: `1px solid rgba(79,160,149,0.18)` }}>
          <div className="flex justify-around">
            <AchievementBadge icon={Sunrise}  label={t('badgeEarlyBird')} unlocked={earlyBird} color="#f59e0b" />
            <AchievementBadge icon={Flame}    label={t('badgeOnFire')}    unlocked={onFire}    color="#ef4444" />
            <AchievementBadge icon={MoonIcon} label={t('badgeNightOwl')}  unlocked={nightOwl}  color={FOREST_LIGHT} />
            <AchievementBadge icon={MapPin}   label={t('badgeExplorer')}  unlocked={user.reports >= 1} color={MINT} />
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
            {t('badgesUnlocked', [earlyBird, onFire, nightOwl, user.reports >= 1].filter(Boolean).length)}
          </p>
        </div>
      </div>

      {/* ── Comment progresser ───────────────────────────────────── */}
      <Section title={t('howToProgress')}>
        <Row icon={MapPin} label={t('actionReport')} value="+50 pts"         iconColor={MINT}         />
        <Row icon={Flame}  label={t('actionStreak')} value={t('comingSoon')} iconColor="#ef4444"      />
        <Row icon={Star}   label={t('actionFirst')}  value={t('comingSoon')} iconColor="#f59e0b"      />
      </Section>

      {/* ── Mon Compte ───────────────────────────────────────────── */}
      <Section title={t('myAccount')}>
        <Row icon={User}  label={t('emailLabel')}    value={maskEmail(displayEmail)} />
        <Row icon={Clock} label={t('memberSince')}   value={formatDate(user.joinedAt)} />
        <Row icon={Lock}  label={t('passwordLabel')} />
      </Section>

      {/* ── Préférences langue ───────────────────────────────────── */}
      <Section title={t('preferences')}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} strokeWidth={2} style={{ color: FOREST_LIGHT }} />
            <span className="text-sm font-medium text-slate-700">{t('languageLabel')}</span>
          </div>
          <div className="flex gap-2 mb-3">
            {[{ code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'en', flag: '🇬🇧', label: 'English' }].map(({ code, flag, label }) => (
              <button key={code} onClick={() => setPendingLang(code)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={pendingLang === code ? {
                        background: FOREST_DEEP, color: MINT,
                        boxShadow: `0 2px 8px rgba(21,52,98,0.25)`,
                      } : {
                        background: '#f2f6f5', color: '#64748b',
                        border: `1px solid rgba(79,160,149,0.20)`,
                      }}>
                <span>{flag}</span> {label}
              </button>
            ))}
          </div>
          {pendingLang !== lang && (
            <button onClick={() => setLanguage(pendingLang)}
                    className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: `linear-gradient(135deg,${FOREST_LIGHT},${FOREST_DEEP})`, color: CREAM }}>
              {t('confirmBtn')}
            </button>
          )}
        </div>
      </Section>

      {/* ── Confidentialité ──────────────────────────────────────── */}
      <Section title={t('privacyData')}>
        <Row icon={Shield} label={t('shareLocation')} toggle toggled={locationShare}
             onClick={() => setLocationShare(v => !v)} />
        <Row icon={Trash2} label={t('deleteAccount')} danger />
      </Section>

      {/* ── Support ──────────────────────────────────────────────── */}
      <Section title={t('supportInfo')}>
        <Row icon={Info}       label={t('appVersion')} value="v1.0.4" />
        <Row icon={Bug}        label={t('reportBug')}  />
        <Row icon={HelpCircle} label={t('helpFaq')}    />
      </Section>

      {/* ── Déconnexion ──────────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <button onClick={() => { resetUser(); signOut() }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                           font-semibold text-sm border transition-colors active:scale-[0.98]"
                style={{ background: '#fff5f5', color: '#ef4444', border: '1px solid #fecaca' }}>
          <LogOut size={16} strokeWidth={2} />
          {t('logout')}
        </button>
      </div>

      <p className="text-center text-xs pb-4 font-medium" style={{ color: `rgba(79,160,149,0.40)` }}>{t('footer')}</p>
    </div>
  )
}
