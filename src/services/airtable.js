/**
 * Service Airtable — table "StudySpots"
 *
 * Colonnes :
 *   Name             Single line text
 *   Type             Single select  ("Bibliothèque" | "Café" | …)
 *   Address          Single line text
 *   OpeningTime      Single line text  ("09:00")
 *   ClosingTime      Single line text  ("22:00")
 *   Vibe             Single line text  ("🤫 Silence total")
 *   Highlight        Long text         ("Vue sur les canaux, WiFi rapide")
 *   Image            Attachment
 *   Lat              Number
 *   Lng              Number
 *   CurrentOccupancy Number (1–5)
 *   LastUpdated      Date & time (ISO 8601)
 */

const BASE_URL = 'https://api.airtable.com/v0'
const TOKEN    = import.meta.env.VITE_AIRTABLE_TOKEN
const BASE_ID  = import.meta.env.VITE_AIRTABLE_BASE_ID
const TABLE    = 'StudySpots'

const RATING_TO_OCCUPANCY = { 1: 10, 2: 30, 3: 55, 4: 75, 5: 95 }
const RECENT_THRESHOLD_MS = 60 * 60 * 1000   // 1 heure

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
}

function toLibrary(record) {
  const f       = record.fields
  const rating  = Number(f.CurrentOccupancy ?? 1)
  const updated = f.LastUpdated ? new Date(f.LastUpdated) : null

  const imageUrl = Array.isArray(f.Image) && f.Image.length > 0
    ? (f.Image[0].thumbnails?.large?.url ?? f.Image[0].url ?? null)
    : null

  return {
    id:               record.id,
    name:             f.Name         ?? 'Sans nom',
    type:             f.Type         ?? 'Bibliothèque',
    address:          f.Address      ?? '',
    openingTime:      f.OpeningTime  ?? '',
    closingTime:      f.ClosingTime  ?? '',
    vibe:             f.Vibe         ?? '',
    highlight:        f.Highlight    ?? '',
    imageUrl,
    lat:              Number(f.Lat),
    lng:              Number(f.Lng),
    currentOccupancy: rating,
    occupancy:        RATING_TO_OCCUPANCY[rating] ?? 50,
    lastUpdated:      updated?.toISOString() ?? null,
    recentReport:     updated
                        ? Date.now() - updated.getTime() < RECENT_THRESHOLD_MS
                        : false,
  }
}

export async function fetchStudySpots() {
  let records = []
  let offset  = null

  do {
    const url = new URL(`${BASE_URL}/${BASE_ID}/${encodeURIComponent(TABLE)}`)
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), { headers: headers() })
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`)

    const data = await res.json()
    records = records.concat(data.records ?? [])
    offset  = data.offset ?? null
  } while (offset)

  return records
    .map(toLibrary)
    .filter(lib => !isNaN(lib.lat) && !isNaN(lib.lng) && lib.lat !== 0 && lib.lng !== 0)
}

export async function updateOccupancy(recordId, rating) {
  const res = await fetch(
    `${BASE_URL}/${BASE_ID}/${encodeURIComponent(TABLE)}/${recordId}`,
    {
      method:  'PATCH',
      headers: headers(),
      body:    JSON.stringify({
        fields: { CurrentOccupancy: rating, LastUpdated: new Date().toISOString() },
      }),
    }
  )
  if (!res.ok) throw new Error(`Airtable update ${res.status}: ${await res.text()}`)
  return toLibrary(await res.json())
}
