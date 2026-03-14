import { useState, useEffect, useCallback } from 'react'
import { fetchStudySpots, updateOccupancy } from '../services/airtable'

/* Données mock utilisées comme fallback si Airtable est inaccessible */
const FALLBACK_LIBRARIES = [
  { id: 'mock-1', name: 'OBA Oosterdok',             address: 'Oosterdokskade 143, Amsterdam',
    lat: 52.3765, lng: 4.9085, occupancy: 82, currentOccupancy: 4, recentReport: true,  openToday: true  },
  { id: 'mock-2', name: 'UvA Roeterseiland',          address: 'Roetersstraat, Amsterdam',
    lat: 52.3633, lng: 4.9105, occupancy: 45, currentOccupancy: 2, recentReport: false, openToday: true  },
  { id: 'mock-3', name: 'VU Amsterdam (Main Library)',address: 'De Boelelaan 1117, Amsterdam',
    lat: 52.3339, lng: 4.8656, occupancy: 60, currentOccupancy: 3, recentReport: true,  openToday: true  },
  { id: 'mock-4', name: 'UvA Science Park (904)',     address: 'Science Park 904, Amsterdam',
    lat: 52.3551, lng: 4.9554, occupancy: 10, currentOccupancy: 1, recentReport: false, openToday: false },
  { id: 'mock-5', name: 'PC Hoofthuis (UvA)',         address: 'Spuistraat 134, Amsterdam',
    lat: 52.3725, lng: 4.8879, occupancy: 95, currentOccupancy: 5, recentReport: true,  openToday: true  },
]

const RATING_TO_OCCUPANCY = { 1: 10, 2: 30, 3: 55, 4: 75, 5: 95 }
const REFRESH_INTERVAL_MS = 2 * 60 * 1000  // 2 minutes

export function useStudySpots() {
  const [libraries, setLibraries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [isMock,    setIsMock]    = useState(false)

  /* ── Chargement initial + auto-refresh ──────────────────────── */
  useEffect(() => {
    let cancelled = false

    async function load(isInitial = false) {
      if (!import.meta.env.VITE_AIRTABLE_TOKEN || !import.meta.env.VITE_AIRTABLE_BASE_ID) {
        if (!cancelled) {
          setLibraries(FALLBACK_LIBRARIES)
          setIsMock(true)
          setError('Variables VITE_AIRTABLE_TOKEN / VITE_AIRTABLE_BASE_ID manquantes — données de démo.')
          setLoading(false)
        }
        return
      }

      try {
        if (isInitial) setLoading(true)
        setError(null)
        const data = await fetchStudySpots()
        if (!cancelled) {
          setLibraries(data)
          setIsMock(false)
        }
      } catch (err) {
        if (!cancelled && isInitial) {
          // Fallback uniquement au premier chargement
          setLibraries(FALLBACK_LIBRARIES)
          setIsMock(true)
          setError(`Impossible de joindre Airtable : ${err.message}`)
        }
        // En cas d'erreur lors d'un refresh silencieux, on garde les données actuelles
      } finally {
        if (!cancelled && isInitial) setLoading(false)
      }
    }

    load(true)

    // Auto-refresh toutes les 2 minutes (silencieux, sans spinner)
    const interval = setInterval(() => {
      if (!cancelled) load(false)
    }, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  /* ── Signalement ────────────────────────────────────────────── */
  const report = useCallback(async (libId, rating) => {
    const occupancy = RATING_TO_OCCUPANCY[rating] ?? 50

    // 1. Mise à jour optimiste de l'UI (immédiate, avant toute réponse serveur)
    setLibraries(prev =>
      prev.map(l =>
        l.id === libId
          ? { ...l, occupancy, currentOccupancy: rating,
              recentReport: true, lastUpdated: new Date().toISOString() }
          : l
      )
    )

    // 2. Persistance Airtable (peut lever une erreur → propagée à l'UI)
    if (!isMock) {
      await updateOccupancy(libId, rating)
    }
  }, [isMock])

  return { libraries, loading, error, isMock, report }
}
