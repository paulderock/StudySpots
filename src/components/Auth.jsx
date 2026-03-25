import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/* ── Premium Refined palette (from Stitch "Login Premium Refined") ── */
const C = {
  primary:       '#004ac6',
  primaryCont:   '#2563eb',
  surface:       '#faf9f6',
  surfaceLow:    '#f4f3f1',
  surfaceHigh:   '#e9e8e5',
  surfaceLowest: '#ffffff',
  onSurface:     '#1a1c1a',
  onSurfaceVar:  '#434655',
  outlineVar:    '#c3c6d7',
  secondary:     '#006c49',
  secondaryCont: '#6cf8bb',
}

/* ── Pill input field ─────────────────────────────────────────────── */
function Field({ iconName, type = 'text', placeholder, value, onChange, autoComplete, rightSlot }) {
  return (
    <div className="relative">
      {/* Left icon */}
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
        <span className="material-symbols-outlined"
              style={{ fontSize: 20, color: C.onSurfaceVar, fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
          {iconName}
        </span>
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full outline-none transition-all"
        style={{
          paddingLeft: 56, paddingRight: rightSlot ? 56 : 24,
          paddingTop: 16, paddingBottom: 16,
          background: C.surfaceLow,
          border: 'none',
          borderRadius: 9999,
          color: C.onSurface,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 15,
        }}
        onFocus={e => { e.target.style.outline = 'none'; e.target.style.boxShadow = `0 0 0 2px rgba(0,74,198,0.25)` }}
        onBlur={e => { e.target.style.boxShadow = 'none' }}
      />
      {rightSlot && (
        <div className="absolute inset-y-0 right-6 flex items-center">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

/* ── Google icon ──────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

/* ── Main component ───────────────────────────────────────────────── */
export default function Auth() {
  const { signIn, signUp, signInWithGoogle, error, setError } = useAuth()
  const { t } = useLanguage()

  const [mode,          setMode]          = useState('login')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done,          setDone]          = useState(false)
  const [showPass,      setShowPass]      = useState(false)

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
    <div className="fixed inset-0" style={{ zIndex: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Google Material Symbols */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" />

      {/* Background — library photo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center"
             style={{ backgroundImage: "url('/bg-library.jpg')", filter: 'brightness(0.75)', transform: 'scale(1.05)' }} />
        <div className="absolute inset-0" style={{ background: `rgba(0,74,198,0.08)`, mixBlendMode: 'multiply' }} />
      </div>

      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 pointer-events-none"
           style={{ width: 400, height: 400, background: `${C.secondaryCont}0d`, filter: 'blur(100px)', borderRadius: '50%' }} />
      <div className="absolute bottom-0 left-0 pointer-events-none"
           style={{ width: 400, height: 400, background: `${C.primary}0d`, filter: 'blur(100px)', borderRadius: '50%' }} />

      {/* Centered layout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          className="w-full"
          style={{ maxWidth: 440 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 200, delay: 0.04 }}
        >
          {/* Card — glass panel with very rounded corners */}
          <div style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 40,
            padding: 8,
            boxShadow: '0 24px 64px rgba(0,74,198,0.15), 0 2px 0 rgba(255,255,255,0.6) inset',
          }}>
            <div style={{ padding: '48px 40px' }}>

              {/* Brand identity */}
              <div className="text-center" style={{ marginBottom: 36 }}>
                <div className="flex items-center justify-center gap-2" style={{ marginBottom: 6 }}>
                  <span style={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    background: C.secondaryCont,
                    boxShadow: '0 0 12px rgba(108,248,187,0.7)',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: C.onSurface,
                    lineHeight: 1,
                  }}>Seatr</span>
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.onSurfaceVar,
                }}>
                  Amsterdam Study Spots
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 justify-center" style={{ marginBottom: 36 }}>
                {(['login', 'signup']).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 16,
                      fontWeight: mode === m ? 700 : 500,
                      color: mode === m ? C.primary : C.onSurfaceVar,
                      borderBottom: mode === m ? `2px solid ${C.primary}` : '2px solid transparent',
                      paddingBottom: 4,
                      background: 'none',
                      border: 'none',
                      borderBottom: mode === m ? `2px solid ${C.primary}` : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {m === 'login' ? t('loginTab') : t('signupTab')}
                  </button>
                ))}
              </div>

              {/* Form area */}
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                  >
                    <CheckCircle2 size={44} className="mx-auto mb-3" strokeWidth={1.5}
                                  style={{ color: C.secondary }} />
                    <p style={{ fontWeight: 600, fontSize: 15, color: C.onSurface }}>{t('checkEmail')}</p>
                    <p style={{ fontSize: 13, marginTop: 6, color: C.onSurfaceVar, lineHeight: 1.5 }}>
                      {t('confirmSent')}<br />
                      <span style={{ fontWeight: 600, color: C.onSurface }}>{email}</span>
                    </p>
                    <button
                      onClick={() => { setDone(false); switchMode('login') }}
                      style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
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
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    {mode === 'signup' && (
                      <>
                        <Field iconName="person" placeholder={t('firstNamePh')} value={firstName} onChange={setFirstName} autoComplete="given-name" />
                        <Field iconName="phone" type="tel" placeholder={t('phonePh')} value={phone} onChange={setPhone} autoComplete="tel" />
                      </>
                    )}

                    <Field iconName="alternate_email" type="email" placeholder={t('emailPh')} value={email} onChange={setEmail} autoComplete="email" />

                    <Field
                      iconName="lock_open"
                      type={showPass ? 'text' : 'password'}
                      placeholder={t('passwordPh')}
                      value={password}
                      onChange={setPassword}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      rightSlot={
                        <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVar, display: 'flex', alignItems: 'center' }}>
                          {showPass ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                        </button>
                      }
                    />

                    {mode === 'login' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 8 }}>
                        <button type="button" style={{ fontSize: 13, fontWeight: 600, color: C.primaryCont, background: 'none', border: 'none', cursor: 'pointer' }}>
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {error && (
                      <p style={{ fontSize: 12, color: '#ba1a1a', textAlign: 'center' }}>{error}</p>
                    )}

                    {/* CTA button — gradient */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%',
                        padding: '16px 32px',
                        background: loading ? C.primary : `linear-gradient(135deg, ${C.primary}, ${C.primaryCont})`,
                        color: '#ffffff',
                        borderRadius: 9999,
                        border: 'none',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: `0 8px 24px rgba(0,74,198,0.30)`,
                        opacity: loading ? 0.75 : 1,
                        transition: 'box-shadow 0.2s, opacity 0.2s',
                        marginTop: 4,
                      }}
                    >
                      {loading
                        ? <Loader2 size={18} className="animate-spin" />
                        : <>{mode === 'login' ? t('loginBtn') : t('signupBtn')}<ArrowRight size={16} strokeWidth={2.5} /></>
                      }
                    </motion.button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                      <div style={{ flex: 1, height: 1, background: `rgba(195,198,215,0.4)` }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: `rgba(67,70,85,0.45)`, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Or continue with
                      </span>
                      <div style={{ flex: 1, height: 1, background: `rgba(195,198,215,0.4)` }} />
                    </div>

                    {/* Google */}
                    <motion.button
                      type="button"
                      onClick={handleGoogle}
                      disabled={googleLoading}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        background: C.surfaceLow,
                        border: `1px solid rgba(195,198,215,0.25)`,
                        borderRadius: 9999,
                        color: C.onSurface,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: googleLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        opacity: googleLoading ? 0.7 : 1,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surfaceHigh}
                      onMouseLeave={e => e.currentTarget.style.background = C.surfaceLow}
                    >
                      {googleLoading
                        ? <Loader2 size={18} className="animate-spin" />
                        : <><GoogleIcon />{t('googleBtn')}</>
                      }
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>
              © 2025 Seatr. Amsterdam Study Spots.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Support', 'Terms', 'Security'].map(lbl => (
                <a key={lbl} href="#"
                   style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                  {lbl}
                </a>
              ))}
            </div>
          </footer>
        </motion.div>
      </div>
    </div>
  )
}
