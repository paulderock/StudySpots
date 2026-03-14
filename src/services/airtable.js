/**
 * Service Airtable — table "StudySpots"
 *
 * Colonnes attendues dans Airtable :
 *   Name             (Single line text)
 *   Lat              (Number)
 *   Lng              (Number)
 *   CurrentOccupancy (Number, valeur 1–5)
 *   LastUpdated      (Date & time, ISO 8601)
 */

const BASE_URL  = 'https://api.airtable.com/v0'
const TOKEN     = import.meta.env.VITE_AIRTABLE_TOKEN
const BASE_ID   = import.meta.env.VITE_AIRTABLE_BASE_ID
const TABLE     = 'StudySpots'

/* Correspondance note 1–5 → pourcentage d'occupation */
const RATING_TO_OCCUPANCY = { 1: 10, 2: 30, 3: 55, 4: 75, 5: 95 }

/* Un signalement est "récent" s'il date de moins d'1 heure */
const RECENT_THRESHOLD_MS = 60 * 60 * 1000

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Convertit un record Airtable brut en objet bibliothèque
 * compatible avec le reste de l'app.
 */
function toLibrary(record) {
  const f       = record.fields
  const rating  = Number(f.CurrentOccupancy ?? 1)
  const updated = f.LastUpdated ? new Date(f.LastUpdated) : null

  return {
    id:               record.id,          // ex: "recABCDEF123"
    name:             f.Name      ?? 'Sans nom',
    address:          f.Address   ?? '',
    lat:              Number(f.Lat),
    lng:              Number(f.Lng),
    currentOccupancy: rating,
    occupancy:        RATING_TO_OCCUPANCY[rating] ?? 50,
    lastUpdated:      updated?.toISOString() ?? null,
    recentReport:     updated
                        ? Date.now() - updated.getTime() < RECENT_THRESHOLD_MS
                        : false,
    openToday:        true, // non géré par Airtable pour l'instant
  }
}

/* ─── Lecture ────────────────────────────────────────────────────── */

/**
 * Récupère tous les StudySpots.
 * Gère automatiquement la pagination Airtable (offset).
 * @returns {Promise<Library[]>}
 */
export async function fetchStudySpots() {
  let records = []
  let offset  = null

  do {
    const url = new URL(`${BASE_URL}/${BASE_ID}/${encodeURIComponent(TABLE)}`)
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), { headers: headers() })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Airtable ${res.status}: ${body}`)
    }

    const data = await res.json()
    records = records.concat(data.records ?? [])
    offset  = data.offset ?? null

  } while (offset)

  return records
    .map(toLibrary)
    .filter(lib => !isNaN(lib.lat) && !isNaN(lib.lng) && lib.lat !== 0 && lib.lng !== 0)
}

/* ─── Écriture ───────────────────────────────────────────────────── */

/**
 * Met à jour CurrentOccupancy et LastUpdated d'un StudySpot.
 * @param {string} recordId  — ID Airtable (ex: "recABCDEF123")
 * @param {1|2|3|4|5} rating — nouvelle note
 * @returns {Promise<Library>}
 */
export async function updateOccupancy(recordId, rating) {
  const res = await fetch(
    `${BASE_URL}/${BASE_ID}/${encodeURIComponent(TABLE)}/${recordId}`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        fields: {
          CurrentOccupancy: rating,
          LastUpdated: new Date().toISOString(),
        },
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Airtable update ${res.status}: ${body}`)
  }

  return toLibrary(await res.json())
}
