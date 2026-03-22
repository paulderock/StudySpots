import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/* ── Dark academic palette (login screen only) ────────────────── */
const D = {
  bg:       '#031425',
  surface:  '#0f2131',
  high:     '#1a2b3c',
  top:      '#253648',
  primary:  '#b7c8de',
  text:     '#d2e4fb',
  muted:    '#c4c6cd',
  outline:  '#8e9197',
  outVar:   '#44474c',
  onPrimary: '#213243',
}

/* ── Input field ──────────────────────────────────────────────── */
function Field({ icon: Icon, type = 'text', placeholder, value, onChange, autoComplete }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: D.muted }}>
        <Icon size={15} strokeWidth={1.6} />
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full pl-10 pr-4 py-3 text-sm outline-none transition-all"
        style={{
          background: `rgba(37,54,72,0.40)`,
          border: `1px solid rgba(68,71,76,0.30)`,
          borderRadius: '0.375rem',
          color: D.text,
          fontFamily: "'Manrope', system-ui, sans-serif",
          letterSpacing: '0.01em',
        }}
        onFocus={e => {
          e.target.style.border = `1px solid rgba(183,200,222,0.45)`
          e.target.style.background = `rgba(37,54,72,0.65)`
        }}
        onBlur={e => {
          e.target.style.border = `1px solid rgba(68,71,76,0.30)`
          e.target.style.background = `rgba(37,54,72,0.40)`
        }}
      />
      <style>{`input::placeholder { color: rgba(196,198,205,0.45); font-size: 13px; }`}</style>
    </div>
  )
}

/* ── Logo ─────────────────────────────────────────────────────── */
function Logo({ t }) {
  return (
    <div className="text-center mb-7">
      {/* Wordmark — Newsreader serif italic */}
      <h1 style={{
        fontFamily: "'Newsreader', 'Georgia', serif",
        fontSize: '38px',
        fontWeight: 300,
        fontStyle: 'italic',
        letterSpacing: '-0.03em',
        color: D.primary,
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        Seatr
      </h1>
      <p style={{
        fontFamily: "'Manrope', system-ui, sans-serif",
        fontSize: '10px',
        letterSpacing: '0.30em',
        textTransform: 'uppercase',
        color: `rgba(196,198,205,0.50)`,
        fontWeight: 500,
      }}>
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

/* ── Main component ───────────────────────────────────────────── */
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
    setLoading(true); setError(null)
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
    <div className="fixed inset-0" style={{ fontFamily: "'Manrope', system-ui, sans-serif", zIndex: 9999 }}>

      {/* Background — deep midnight + library photo */}
      <div className="absolute inset-0 bg-cover bg-center"
           style={{ backgroundImage: "url('/bg-library.jpg')", filter: 'brightness(0.55)' }} />
      <div className="absolute inset-0"
           style={{ background: 'rgba(3,20,37,0.72)' }} />

      {/* Centered card */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          className="w-full max-w-xs"
          style={{
            background: 'rgba(11,29,45,0.78)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '0.375rem',
            border: `1px solid rgba(68,71,76,0.20)`,
            borderTop: `1px solid rgba(183,200,222,0.15)`,
            boxShadow: `0 32px 64px rgba(0,15,31,0.50), 0 0 0 0.5px rgba(183,200,222,0.06)`,
            padding: '2rem 1.75rem',
          }}
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 180, delay: 0.05 }}
        >
          <Logo t={t} />

          {/* Tabs — Newsreader serif style */}
          <div className="flex gap-8 justify-center mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="pb-1.5 transition-all duration-150"
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: '20px',
                  fontWeight: mode === m ? 400 : 300,
                  fontStyle: 'italic',
                  color: mode === m ? D.primary : `rgba(196,198,205,0.35)`,
                  borderBottom: mode === m ? `1.5px solid ${D.primary}` : '1.5px solid transparent',
                  letterSpacing: '-0.01em',
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
                              style={{ color: D.primary }} />
                <p className="font-semibold text-sm" style={{ color: D.text }}>{t('checkEmail')}</p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: `rgba(196,198,205,0.65)` }}>
                  {t('confirmSent')}<br />
                  <span className="font-medium" style={{ color: D.text }}>{email}</span>
                </p>
                <button
                  onClick={() => { setDone(false); switchMode('login') }}
                  className="mt-5 text-xs font-medium underline underline-offset-2"
                  style={{ color: D.primary }}
                >
                  {t('backToLogin')}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                className="space-y-3"
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

                {/* Primary CTA — solid primary */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 mt-1 transition-opacity"
                  style={{
                    background: D.primary,
                    color: D.onPrimary,
                    borderRadius: '0.375rem',
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <>{mode === 'login' ? t('loginBtn') : t('signupBtn')} <ArrowRight size={13} strokeWidth={2.5} /></>
                  }
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px" style={{ background: `rgba(68,71,76,0.40)` }} />
                  <span style={{ fontSize: '10px', fontWeight: 500, color: `rgba(142,145,151,0.70)`, letterSpacing: '0.10em' }}>
                    {t('orSeparator')}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `rgba(68,71,76,0.40)` }} />
                </div>

                {/* Google */}
                <motion.button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2.5 py-3 transition-all"
                  style={{
                    background: 'transparent',
                    border: `1px solid rgba(68,71,76,0.35)`,
                    borderRadius: '0.375rem',
                    color: `rgba(210,228,251,0.80)`,
                    fontSize: '13px',
                    fontWeight: 500,
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

          <p className="text-center mt-6" style={{
            fontSize: '10px',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: `rgba(142,145,151,0.35)`,
            fontFamily: "'Manrope', system-ui, sans-serif",
          }}>
            {t('authFooter')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
