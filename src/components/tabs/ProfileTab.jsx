import { useState, useRef } from 'react'
import {
  User, Globe, Bell, HelpCircle, Bug, Info, LogOut,
  ChevronRight, Flame, Sparkles, Sunrise, Lock,
  MapPin, CreditCard, ArrowLeft, Clock,
  Shield, Camera, BarChart2, Award,
} from 'lucide-react'
import { useUser, getBadge } from '../../context/UserContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

/* ── Palette tokens ───────────────────────────────────────────── */
const C = {
  bg:          '#f5f6ff',
  surfaceTop:  '#ffffff',
  surfaceLow:  '#edf0ff',
  surfaceVar:  '#d0ddff',
  primary:     '#005da4',
  primaryCont: '#4fa4ff',
  secondary:   '#00694d',
  secCont:     '#60fcc6',
  tertiary:    '#6e5900',
  error:       '#b31b25',
  text:        '#1c2e51',
  muted:       '#4a5b80',
  outline:     '#65779d',
  outlineVar:  '#9badd7',
}

/* ── Section wrapper ──────────────────────────────────────────── */
function SectionGroup({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '11px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: `rgba(74,91,128,0.60)`, paddingLeft: 4,
      }}>
        {title}
      </h3>
      <div style={{
        background: C.surfaceTop, borderRadius: '1rem',
        border: `1px solid rgba(155,173,215,0.15)`, overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

/* ── Settings row ─────────────────────────────────────────────── */
function SettingsRow({ icon: Icon, label, value, danger, toggle, toggled, onClick, iconColor, last }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors"
      style={{ borderBottom: last ? 'none' : `1px solid rgba(224,232,255,0.8)` }}
      onMouseEnter={e => e.currentTarget.style.background = C.surfaceLow}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div className="flex items-center gap-4">
        <Icon size={18} strokeWidth={1.8} style={{ color: danger ? C.error : iconColor ?? C.primary }} />
        <span className="text-sm font-medium"
              style={{ color: danger ? C.error : C.text, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {label}
        </span>
      </div>
      {toggle ? (
        <div className="w-10 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200"
             style={{ background: toggled ? C.secondary : `${C.outlineVar}50` }}>
          <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
               style={{ transform: toggled ? 'translateX(16px)' : 'translateX(0)' }} />
        </div>
      ) : value ? (
        <span className="text-xs font-semibold" style={{ color: C.muted }}>{value}</span>
      ) : (
        <ChevronRight size={15} strokeWidth={2} style={{ color: C.outlineVar }} className="shrink-0" />
      )}
    </button>
  )
}

/* ── Badge card — rounded-full icon ──────────────────────────── */
function BadgeCard({ icon: Icon, label, unlocked, color }) {
  return (
    <div className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-transform active:scale-95"
         style={{ background: C.surfaceLow }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
           style={{ background: unlocked ? `${color}18` : `rgba(155,173,215,0.15)` }}>
        <Icon size={22} strokeWidth={1.6}
              style={{ color: unlocked ? color : C.outlineVar }} />
      </div>
      <span className="text-center leading-tight"
            style={{
              fontSize: '10px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: unlocked ? C.muted : `rgba(155,173,215,0.65)`,
            }}>
        {label}
      </span>
    </div>
  )
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon: Icon, sub, subColor }) {
  return (
    <div className="flex-1 flex flex-col px-5 py-5"
         style={{
           background: C.surfaceTop, borderRadius: '1.5rem',
           border: `1px solid rgba(155,173,215,0.12)`,
           boxShadow: '0 4px 24px rgba(28,46,81,0.07)',
         }}>
      {/* Icon + label row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full flex items-center justify-center"
             style={{ background: 'rgba(0,93,164,0.09)' }}>
          <Icon size={19} strokeWidth={1.6} style={{ color: C.primary }} />
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: C.muted,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.3,
        }}>
          {label}
        </span>
      </div>
      {/* Value */}
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em',
        color: C.text, lineHeight: 1,
      }}>
        {value}
      </span>
      {/* Subtitle */}
      {sub && (
        <span style={{
          fontSize: '12px', fontWeight: 600,
          color: subColor ?? C.muted, marginTop: 6,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          {sub}
        </span>
      )}
    </div>
  )
}

/* ── Activity sub-page ────────────────────────────────────────── */
function ActivityPage({ activities, onBack }) {
  function formatTimeAgo(iso, t) {
    const diff = (Date.now() - new Date(iso)) / 1000
    if (diff < 60)    return 'À l\'instant'
    if (diff < 3600)  return `${Math.floor(diff/60)} min`
    if (diff < 86400) return `${Math.floor(diff/3600)}h`
    return `${Math.floor(diff/86400)}j`
  }

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto pb-8"
         style={{ background: C.bg, scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <button onClick={onBack}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: C.surfaceLow }}>
          <ArrowLeft size={16} strokeWidth={2} style={{ color: C.text }} />
        </button>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '18px', fontWeight: 800,
          letterSpacing: '-0.02em', color: C.text,
        }}>
          Activités récentes
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="text-4xl">📭</span>
          <p className="text-sm font-semibold" style={{ color: C.muted }}>Aucune activité pour l'instant</p>
          <p className="text-xs" style={{ color: C.outlineVar }}>Tes signalements apparaîtront ici</p>
        </div>
      ) : (
        <div className="px-5 space-y-2">
          {activities.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                 style={{ background: C.surfaceTop, border: `1px solid rgba(155,173,215,0.12)` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: `rgba(0,105,77,0.10)` }}>
                <MapPin size={14} strokeWidth={2} style={{ color: C.secondary }} />
              </div>
              <span className="flex-1 text-sm font-medium" style={{ color: C.text,
                fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {a.label}
              </span>
              <span className="text-sm font-bold" style={{ color: C.secondary }}>{a.pts}</span>
              <span className="text-[11px] ml-1" style={{ color: C.muted }}>{formatTimeAgo(a.at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export default function ProfileTab() {
  const { user, rank, badge, resetUser } = useUser()
  const { user: authUser, signOut } = useAuth()
  const { lang, setLanguage, t } = useLanguage()
  const [notifOn,       setNotifOn]       = useState(true)
  const [locationOn,    setLocationOn]    = useState(false)
  const [showActivity,  setShowActivity]  = useState(false)
  const [avatarUrl,     setAvatarUrl]     = useState(() => localStorage.getItem('seatr_avatar') ?? null)
  const fileInputRef = useRef(null)

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target.result
      setAvatarUrl(url)
      try { localStorage.setItem('seatr_avatar', url) } catch {}
    }
    reader.readAsDataURL(file)
  }

  const displayEmail = authUser?.email ?? user.email
  const onFire       = user.reports >= 3
  const isExplorer   = user.reports >= 1

  function maskEmail(email) {
    const [local, domain] = email.split('@')
    return local.slice(0, 2) + '••••@' + domain
  }

  return (
    <div className="absolute inset-0" style={{ background: C.bg }}>

      {/* ── Activity sub-page (slide in) ──────────────────────── */}
      {showActivity && (
        <ActivityPage
          activities={user.recentActivity ?? []}
          onBack={() => setShowActivity(false)}
        />
      )}

      {/* ── Main profile scroll ───────────────────────────────── */}
      <div className="absolute inset-0 overflow-y-auto pb-32"
           style={{ scrollbarWidth: 'none' }}>

        {/* ══ User identity ══════════════════════════════════════ */}
        <section className="flex flex-col items-center text-center px-6 pt-14 pb-5 space-y-4">

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*"
                 className="hidden" onChange={handleAvatarChange} />

          {/* Avatar — clickable to upload */}
          <button onClick={() => fileInputRef.current?.click()}
                  className="relative focus:outline-none"
                  aria-label="Change profile photo">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
                 style={{
                   background: `linear-gradient(135deg, #edf0ff, #d0ddff)`,
                   boxShadow: '0 0 0 4px rgba(255,255,255,0.9), 0 4px 24px rgba(28,46,81,0.14)',
                 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '36px', fontWeight: 800, color: C.primary,
                }}>
                  {user.fullName.charAt(0)}
                </span>
              )}
            </div>
            {/* Camera badge */}
            <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                 style={{ background: C.primary }}>
              <Camera size={13} strokeWidth={2.5} style={{ color: '#ffffff' }} />
            </div>
          </button>

          {/* Name */}
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: C.text,
          }}>
            {user.fullName}
          </h2>

        </section>

        {/* ══ Stat cards — separated ═════════════════════════════ */}
        <div className="flex gap-3 px-6 mb-6">
          <StatCard
            label={t('statScore')}
            value={user.score.toLocaleString('fr-FR')}
            color={C.primary}
            icon={BarChart2}
            sub={`+${user.reports * 50} pts total`}
            subColor={C.secondary}
          />
          <StatCard
            label={t('statRank')}
            value={rank != null ? `#${rank}` : '—'}
            color={C.primary}
            icon={Award}
            sub={rank != null ? `Top étudiant` : '—'}
          />
        </div>

        {/* ══ Curated Badges ════════════════════════════════════ */}
        <section className="px-6 mb-6 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px', fontWeight: 700, color: C.primary,
            }}>
              {t('badges')}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <BadgeCard icon={Flame}    label={t('badgeOnFire')}    unlocked={onFire}    color={C.error}     />
            <BadgeCard icon={Sparkles} label={t('badgeExplorer')}  unlocked={isExplorer} color={C.primary}  />
            <BadgeCard icon={Sunrise}  label={t('badgeEarlyBird')} unlocked={false}     color={C.tertiary}  />
            <BadgeCard icon={Lock}     label={t('locked')}         unlocked={false}     color={C.outlineVar}/>
          </div>
        </section>

        {/* ══ Account ═══════════════════════════════════════════ */}
        <div className="px-6 mb-4">
          <SectionGroup title={t('myAccount')}>
            <SettingsRow icon={User}       label="My Account"     iconColor={C.primary} />
            <SettingsRow icon={CreditCard} label="Pricing & Data" iconColor={C.primary} last />
          </SectionGroup>
        </div>

        {/* ══ Preferences ═══════════════════════════════════════ */}
        <div className="px-6 mb-4">
          <SectionGroup title={t('preferences')}>
            <div className="px-4 py-3.5" style={{ borderBottom: `1px solid rgba(224,232,255,0.8)` }}>
              <div className="flex items-center gap-4 mb-3">
                <Globe size={18} strokeWidth={1.8} style={{ color: C.secondary }} />
                <span className="text-sm font-medium" style={{ color: C.text,
                  fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {t('languageLabel')}
                </span>
              </div>
              <div className="flex gap-2">
                {[{ code: 'fr', flag: '🇫🇷', label: 'Français' },
                  { code: 'en', flag: '🇬🇧', label: 'English' }].map(({ code, flag, label }) => (
                  <button key={code} onClick={() => setLanguage(code)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all"
                          style={lang === code ? {
                            background: C.primary, color: '#ffffff',
                            boxShadow: `0 4px 12px rgba(0,93,164,0.22)`,
                          } : {
                            background: C.surfaceLow, color: C.muted,
                            border: `1px solid rgba(155,173,215,0.20)`,
                          }}>
                    {flag} {label}
                  </button>
                ))}
              </div>
            </div>
            <SettingsRow icon={Bell}   label={t('notifications')} toggle toggled={notifOn}
                         onClick={() => setNotifOn(v => !v)} iconColor={C.secondary} />
            <SettingsRow icon={Shield} label={t('shareLocation')} toggle toggled={locationOn}
                         onClick={() => setLocationOn(v => !v)} iconColor={C.secondary} last />
          </SectionGroup>
        </div>

        {/* ══ Activity row ══════════════════════════════════════ */}
        <div className="px-6 mb-4">
          <SectionGroup title={t('recentActivity')}>
            <SettingsRow
              icon={Clock}
              label={t('recentActivity')}
              value={user.recentActivity?.length > 0 ? `${user.recentActivity.length} signalement${user.recentActivity.length > 1 ? 's' : ''}` : '—'}
              onClick={() => setShowActivity(true)}
              iconColor={C.secondary}
              last
            />
          </SectionGroup>
        </div>

        {/* ══ Support & Info ════════════════════════════════════ */}
        <div className="px-6 mb-4">
          <SectionGroup title={t('supportInfo')}>
            <SettingsRow icon={HelpCircle} label={t('helpFaq')}    iconColor={C.primary} />
            <SettingsRow icon={Bug}        label={t('reportBug')}  iconColor={C.primary} />
            <SettingsRow icon={Info}       label={t('appVersion')} value="v1.0.4" iconColor={C.outline} last />
          </SectionGroup>
        </div>

        {/* ══ Logout ════════════════════════════════════════════ */}
        <div className="px-6 mb-4">
          <button onClick={() => { resetUser(); signOut() }}
                  className="w-full flex items-center justify-center gap-3 py-4 font-bold text-sm transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(179,27,37,0.05)', color: C.error,
                    border: `1px solid rgba(179,27,37,0.12)`, borderRadius: '1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(179,27,37,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(179,27,37,0.05)'}>
            <LogOut size={17} strokeWidth={2} />
            {t('logout')}
          </button>
        </div>

        <p className="text-center text-xs pb-6 font-medium" style={{ color: C.outlineVar }}>
          {t('footer')}
        </p>
      </div>
    </div>
  )
}
