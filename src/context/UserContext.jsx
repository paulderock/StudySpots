import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext(null)

const DEFAULT_USER = {
  name: 'Paul',
  fullName: 'Paul de Rocquigny',
  email: 'paul.derocquigny@gmail.com',
  joinedAt: '2025-01-15',
  avatar: null,
  score: 0,
  reports: 0,
  recentActivity: [],
}

/* Niveaux : Graine → Pousse → Explorateur → Maître des Spots */
export function getBadge(score) {
  if (score >= 1500) return { label: 'Maître des Spots', color: '#f59e0b', next: null,  prev: 1500 }
  if (score >= 500)  return { label: 'Explorateur',      color: '#3b82f6', next: 1500, prev: 500  }
  if (score >= 100)  return { label: 'Pousse',           color: '#10b981', next: 500,  prev: 100  }
  return               { label: 'Graine',            color: '#94a3b8', next: 100,  prev: 0    }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studyspot_user')
      return saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER
    } catch { return DEFAULT_USER }
  })

  // Charge le score réel depuis Supabase au démarrage
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, score, reports')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setUser(prev => ({
          ...prev,
          fullName: data.full_name ?? prev.fullName,
          score:    data.score   ?? prev.score,
          reports:  data.reports ?? prev.reports,
        }))
      }
    })
  }, [])

  async function addScore(points = 50, spotName = '') {
    const activity = {
      label: spotName ? `Signalement à ${spotName}` : 'Signalement',
      pts: `+${points} pts`,
      at: new Date().toISOString(),
    }

    // Mise à jour locale immédiate
    setUser(prev => {
      const next = {
        ...prev,
        score:          prev.score + points,
        reports:        prev.reports + 1,
        recentActivity: [activity, ...(prev.recentActivity ?? [])].slice(0, 5),
      }
      try { localStorage.setItem('studyspot_user', JSON.stringify(next)) } catch {}
      return next
    })

    // Sync Supabase
    if (supabase) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('score, reports')
          .eq('id', authUser.id)
          .single()
        if (profile) {
          await supabase
            .from('profiles')
            .update({
              score:   (profile.score   ?? 0) + points,
              reports: (profile.reports ?? 0) + 1,
            })
            .eq('id', authUser.id)
        }
      }
    }
  }

  function resetUser() {
    localStorage.removeItem('studyspot_user')
    setUser(DEFAULT_USER)
  }

  return (
    <UserContext.Provider value={{ user, addScore, resetUser, badge: getBadge(user.score) }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
