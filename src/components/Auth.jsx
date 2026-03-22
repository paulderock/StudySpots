import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/* ── Palette ──────────────────────────────────────────────────── */
const P = {
  cream:       '#F6F6C9',
  mint:        '#8AD1C2',
  forestLight: '#4FA095',
  forestDeep:  '#153462',
}

/* ── Champ de saisie ─────────────────────────────────────────── */
function Field({ icon: Icon, type = 'text', placeholder, value, onChange, autoComplete }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(138,209,194,0.65)' }}>
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'rgba(15,35,65,0.55)',
          border: '1px solid rgba(79,160,149,0.22)',
          color: P.cream,
        }}
        onFocus={e => {
          e.target.style.border = `1px solid rgba(138,209,194,0.60)`
          e.target.style.background = 'rgba(15,35,65,0.70)'
        }}
        onBlur={e => {
          e.target.style.border = '1px solid rgba(79,160,149,0.22)'
          e.target.style.background = 'rgba(15,35,65,0.55)'
        }}
      />
      <style>{`input::placeholder { color: rgba(138,209,194,0.40); font-size: 13px; }`}</style>
    </div>
  )
}

/* ── Logo SVG mark ───────────────────────────────────────────── */
function SeatrMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 52 52" fill="none"
         style={{ filter: `drop-shadow(0 0 12px rgba(138,209,194,0.55))` }}>
      <path
        d="M26 4C17.716 4 11 10.716 11 19c0 5.48 2.8 10.3 7.06 13.18L26 48l7.94-15.82C38.2 29.3 41 24.48 41 19c0-8.284-6.716-15-15-15z"
        stroke={P.mint} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path
        d="M20 22c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke={P.mint} strokeWidth="2.2" strokeLinecap="round" fill="none"
      />
      <line x1="19" y1="24.5" x2="33" y2="24.5" stroke={P.mint} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="21" y1="24.5" x2="21" y2="29" stroke={P.mint} strokeWidth="2" strokeLinecap="round"/>
      <line x1="31" y1="24.5" x2="31" y2="29" stroke={P.mint} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function Logo({ t }) {
  return (
    <div className="text-center mb-5">
      <div className="flex items-center justify-center mb-3">
        <SeatrMark />
      </div>
      <h1 style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        fontSize: '28px',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        color: P.mint,
        lineHeight: 1,
        marginBottom: '6px',
        textShadow: `0 0 28px rgba(138,209,194,0.40)`,
      }}>
        Seatr
      </h1>
      <p style={{ fontSize: '11.5px', color: `rgba(246,246,201,0.55)`, fontWeight: 400, letterSpacing: '0.015em' }}>
        {t('tagline')}
      </p>
    </div>
  )
}

/* ── Google icon ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

/* ── Composant principal ─────────────────────────────────────── */
export default function Auth() {
  const { signIn, signUp, signInWithGoogle, error, setError } = useAuth()
  const { t } = useLanguage()

  const [mode,          setMode]          = useState('login')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done,          setDone]          = useState(false)

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [firstName, setFirstName] = useState('')
  const [phone,     setPhone]     = useState('')

  function switchMode(m) { setMode(m); setError(null); setDone(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (mode === 'login') {
      await signIn(email, password)
    } else {
      const ok = await signUp(email, password, firstName, phone)
      if (ok) setDone(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <div className="fixed inset-0" style={{ fontFamily: "'Inter', sans-serif", zIndex: 9999 }}>

      {/* Layer 1 — Library image, sharp, full viewport */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-library.jpg')", filter: 'brightness(0.80)' }}
      />

      {/* Layer 2 — Forest deep colour wash (#153462) to unify the palette */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(21,52,98,0.52)' }}
      />

      {/* Layer 3 — Centered card */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          className="w-full max-w-xs p-5"
          style={{
            background: 'rgba(15,30,60,0.52)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            borderRadius: '24px',
            /* Top edge glows mint — simulates a light source from above */
            border: '1px solid rgba(79,160,149,0.20)',
            borderTop: '1px solid rgba(138,209,194,0.30)',
            boxShadow: '0 25px 60px -12px rgba(10,20,50,0.70), 0 0 0 0.5px rgba(138,209,194,0.08)',
          }}
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 180, delay: 0.05 }}
        >
          <Logo t={t} />

          {/* Tabs */}
          <div className="flex gap-6 justify-center mb-5">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="pb-1.5 text-sm font-semibold transition-all duration-150"
                style={{
                  color:        mode === m ? P.mint : `rgba(246,246,201,0.40)`,
                  borderBottom: mode === m ? `2px solid ${P.mint}` : '2px solid transparent',
                }}
              >
                {m === 'login' ? t('loginTab') : t('signupTab')}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <CheckCircle2 size={40} className="mx-auto mb-3" strokeWidth={1.5}
                              style={{ color: P.mint }} />
                <p className="font-semibold text-sm" style={{ color: P.cream }}>{t('checkEmail')}</p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: `rgba(246,246,201,0.60)` }}>
                  {t('confirmSent')}<br />
                  <span className="font-medium" style={{ color: P.cream }}>{email}</span>
                </p>
                <button
                  onClick={() => { setDone(false); switchMode('login') }}
                  className="mt-5 text-xs font-medium underline underline-offset-2"
                  style={{ color: P.mint }}
                >
                  {t('backToLogin')}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                className="space-y-2.5"
              >
                {mode === 'signup' && (
                  <>
                    <Field icon={User}  placeholder={t('firstNamePh')} value={firstName} onChange={setFirstName} autoComplete="given-name" />
                    <Field icon={Phone} type="tel" placeholder={t('phonePh')} value={phone} onChange={setPhone} autoComplete="tel" />
                  </>
                )}
                <Field icon={Mail} type="email"    placeholder={t('emailPh')}    value={email}    onChange={setEmail}    autoComplete="email" />
                <Field icon={Lock} type="password" placeholder={t('passwordPh')} value={password} onChange={setPassword} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />

                {error && (
                  <p className="text-xs text-center px-1" style={{ color: '#fca5a5' }}>{error}</p>
                )}

                {/* Bouton principal */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                             text-sm font-bold mt-1 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${P.forestLight} 0%, #3d8a80 100%)`,
                    color: P.cream,
                    boxShadow: `0 6px 28px rgba(79,160,149,0.45), 0 0 0 1px rgba(79,160,149,0.20)`,
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <>{mode === 'login' ? t('loginBtn') : t('signupBtn')}<ArrowRight size={14} strokeWidth={2.5} /></>
                  }
                </motion.button>

                {/* Séparateur */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px" style={{ background: 'rgba(79,160,149,0.22)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(138,209,194,0.45)' }}>{t('orSeparator')}</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(79,160,149,0.22)' }} />
                </div>

                {/* Google */}
                <motion.button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl
                             text-sm font-semibold transition-all"
                  style={{
                    background: 'rgba(246,246,201,0.06)',
                    border: `1px solid rgba(246,246,201,0.18)`,
                    color: `rgba(246,246,201,0.85)`,
                    opacity: googleLoading ? 0.7 : 1,
                  }}
                >
                  {googleLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><GoogleIcon />{t('googleBtn')}</>
                  }
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-[10px] mt-5" style={{ color: 'rgba(138,209,194,0.30)' }}>
            {t('authFooter')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
