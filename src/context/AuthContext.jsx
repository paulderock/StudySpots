import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      phone: phone || undefined,
      options: {
        data: { first_name: firstName, phone },
      },
    })
    if (error) { setError(error.message); return false }
    return true
  }

  async function signIn(email, password) {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return false }
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
