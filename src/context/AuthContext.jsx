import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

/* ── Traduit les erreurs Supabase en français ─────────────────── */
function translateError(msg = '') {
  if (!msg) return 'Une erreur est survenue.'
  const m = msg.toLowerCase()
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Cet email est déjà utilisé. Connecte-toi ou utilise un autre email.'
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Email ou mot de passe incorrect.'
  if (m.includes('email not confirmed'))
    return 'Confirme ton email avant de te connecter.'
  if (m.includes('password should be at least'))
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (m.includes('rate limit') || m.includes('too many requests'))
    return 'Trop de tentatives. Réessaie dans quelques minutes.'
  if (m.includes('database error saving new user'))
    return 'Erreur lors de la création du compte. Réessaie.'
  if (m.includes('unable to validate email'))
    return 'Adresse email invalide.'
  return msg
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!supabase) { setSession(null); return }

    // Récupère la session courante
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    // Écoute les changements (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, firstName, phone) {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone: phone || undefined,
      options: {
        data: { first_name: firstName, phone },
      },
    })
    if (error) { setError(translateError(error.message)); return false }
    // Le profil est créé automatiquement par le trigger handle_new_user() côté Supabase
    return true
  }

  async function signIn(email, password) {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(translateError(error.message)); return false }
    return true
  }

  async function signOut() {
    await supabase?.auth.signOut()
    setSession(null)
  }

  const user = session?.user ?? null

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading: session === undefined,
      error,
      setError,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
