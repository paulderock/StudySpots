/**
 * Service Airtable — table "StudySpots"
 *
 * Colonnes attendues dans Airtable :
 *   Name             (Single line text)
 *   Type             (Single select — ex : "Bibliothèque" | "Café")
 *   Address          (Single line text)
 *   OpeningHours     (Single line text — ex : "Lun–Ven 9h–22h")
 *   Image            (Attachment — 1 fichier image)
 *   Lat              (Number)
 *   Lng              (Number)
 *   CurrentOccupancy (Number, valeur 1–5)
 *   LastUpdated      (Date & time, ISO 8601)
 */

const BASE_URL  = 'https://api.airtable.com/v0'
const TOKEN     = import.meta.env.VITE_AIRTABLE_TOKEN
const BASE_ID   = import.meta.env.VITE_AIRTABLE_BASE_ID
const TABLE     = 'StudySpots'

const RATING_TO_OCCUPANCY = { 1: 10, 2: 30, 3: 55, 4: 75, 5: 95 }
const RECENT_THRESHOLD_MS = 60 * 60 * 1000   // 1 heure

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Convertit un record Airtable brut en objet StudySpot.
 */
function toLibrary(record) {
  const f       = record.fields
  const rating  = Number(f.CurrentOccupancy ?? 1)
  const updated = f.LastUpdated ? new Date(f.LastUpdated) : null

  // Champ Attachment Airtable → tableau d'objets { url, thumbnails, … }
  const imageUrl = Array.isArray(f.Image) && f.Image.length > 0
    ? (f.Image[0].thumbnails?.large?.url ?? f.Image[0].url ?? null)
    : null

  return {
    id:               record.id,
    name:             f.Name         ?? 'Sans nom',
    type:             f.Type         ?? 'Bibliothèque',
    address:          f.Address      ?? '',
    openingHours:     f.OpeningHours ?? '',
    imageUrl,
    lat:              Number(f.Lat),
    lng:              Number(f.Lng),
    currentOccupancy: rating,
    occupancy:        RATING_TO_OCCUPANCY[rating] ?? 50,
    lastUpdated:      updated?.toISOString() ?? null,
    recentReport:     updated
                        ? Date.now() - updated.getTime() < RECENT_THRESHOLD_MS
                        : false,
    openToday:        true,
  }
}

/* ─── Lecture ────────────────────────────────────────────────────── */

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
