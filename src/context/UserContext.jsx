import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

const DEFAULT_USER = {
  name: 'Paul',
  fullName: 'Paul de Rocquigny',
  avatar: null,
  score: 0,
  reports: 0,
}

function getBadge(score) {
  if (score >= 2000) return { label: 'Légende',      emoji: '🏆', color: '#f59e0b', next: null }
  if (score >= 1000) return { label: 'Guide Expert', emoji: '⭐', color: '#3b82f6', next: 2000 }
  if (score >= 500)  return { label: 'Habitué',      emoji: '📚', color: '#10b981', next: 1000 }
  if (score >= 100)  return { label: 'Curieux',      emoji: '🔍', color: '#8b5cf6', next: 500  }
  return               { label: 'Nouveau',      emoji: '🌱', color: '#94a3b8', next: 100  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studyspot_user')
      return saved ? { ...DEFAULT_USER, ...JSON.parse(saved) } : DEFAULT_USER
    } catch { return DEFAULT_USER }
  })

  function addScore(points = 50) {
    setUser(prev => {
      const next = { ...prev, score: prev.score + points, reports: prev.reports + 1 }
      try { localStorage.setItem('studyspot_user', JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <UserContext.Provider value={{ user, addScore, badge: getBadge(user.score) }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
