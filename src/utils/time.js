/**
 * Calcule si un lieu est actuellement ouvert.
 * @param {string} openingTime  — ex : "09:00"
 * @param {string} closingTime  — ex : "22:00"
 * @returns {boolean|null}  true = ouvert, false = fermé, null = inconnu
 */
export function isLibOpen(openingTime, closingTime) {
  if (!openingTime || !closingTime) return null

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const [openH, openM]   = openingTime.split(':').map(Number)
  const [closeH, closeM] = closingTime.split(':').map(Number)
  const openMin  = openH  * 60 + openM
  const closeMin = closeH * 60 + closeM

  // Gère le cas "ferme après minuit" (ex : 08:00–01:00)
  if (closeMin < openMin) {
    return nowMin >= openMin || nowMin < closeMin
  }
  return nowMin >= openMin && nowMin < closeMin
}

/**
 * Formate deux horaires en chaîne lisible.
 * ex : "09:00", "22:00" → "9h – 22h"
 */
export function formatHours(openingTime, closingTime) {
  if (!openingTime || !closingTime) return null
  const fmt = (t) => {
    const [h, m] = t.split(':').map(Number)
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
  }
  return `${fmt(openingTime)} – ${fmt(closingTime)}`
}
