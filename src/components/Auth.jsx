import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* ── Champ de saisie épuré style Linear ───────────────────────── */
function Field({ icon: Icon, type = 'text', placeholder, value, onChange, autoComplete }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-800
                   placeholder:text-slate-400 outline-none transition-all"
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
        onFocus={e => {
          e.target.style.border = '1px solid #94a3b8'
          e.target.style.background = '#fff'
        }}
        onBlur={e => {
          e.target.style.border = '1px solid #e2e8f0'
          e.target.style.background = '#f8fafc'
        }}
      />
    </div>
  )
}

/* ── Logo & titre ─────────────────────────────────────────────── */
function Logo() {
  return (
    <div className="text-center mb-8">
      <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
        <span className="text-white text-xl">📚</span>
      </div>
      <h1 className="text-[22px] font-extrabold tracking-tighter text-slate-900 leading-tight">
        Study<span className="text-blue-500">Spot</span> AMS
      </h1>
      <p className="text-xs text-slate-400 mt-1 font-medium">
        La carte des spots d'étude à Amsterdam
      </p>
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────────── */
export default function Auth() {
  const { signIn, signUp, error, setError } = useAuth()

  const [mode,      setMode]      = useState('login')   // 'login' | 'signup'
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)     // après inscription

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [firstName, setFirstName] = useState('')

  function switchMode(m) {
    setMode(m)
    setError(null)
    setDone(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      await signIn(email, password)
    } else {
      const ok = await signUp(email, password, firstName)
      if (ok) setDone(true)
    }
    setLoading(false)
  }

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center px-6"
         style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="w-full max-w-xs">
        <Logo />

        {/* Toggle Login / Signup */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={mode === m ? {
                background: 'white',
                color: '#0f172a',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              } : { color: '#94a3b8' }}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            /* ── Confirmation email ──────────────────────────── */
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-semibold text-slate-800 text-sm">Vérifie tes emails !</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Un lien de confirmation a été envoyé à<br />
                <span className="font-medium text-slate-600">{email}</span>
              </p>
              <button
                onClick={() => { setDone(false); switchMode('login') }}
                className="mt-5 text-xs text-blue-500 font-medium underline underline-offset-2"
              >
                Retour à la connexion
              </button>
            </motion.div>
          ) : (
            /* ── Formulaire ──────────────────────────────────── */
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {mode === 'signup' && (
                <Field
                  icon={User}
                  placeholder="Ton prénom"
                  value={firstName}
                  onChange={setFirstName}
                  autoComplete="given-name"
                />
              )}
              <Field
                icon={Mail}
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <Field
                icon={Lock}
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {/* Erreur */}
              {error && (
                <p className="text-xs text-red-500 text-center px-1">{error}</p>
              )}

              {/* Bouton submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           text-sm font-semibold text-white mt-1 transition-opacity"
                style={{
                  background: '#0f172a',
                  boxShadow: '0 2px 12px rgba(15,23,42,0.25)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <>
                      {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                      <ArrowRight size={15} strokeWidth={2} />
                    </>
                }
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer discret */}
        <p className="text-center text-[10px] text-slate-300 mt-8">
          StudySpot AMS · Amsterdam · 2025
        </p>
      </div>
    </div>
  )
}
