/* ════════════════════════════════════════════════════════════════
   SEATR — Lumina Campus Palette (Modern Academic Excellence)
   Inspired by "The Digital Curator" — editorial, quiet, authoritative
   ════════════════════════════════════════════════════════════════

   Philosophy: Academic · Institutional · Refined
   Light theme surfaces: Midnight Blue wells + Warm Ivory text
   ════════════════════════════════════════════════════════════════ */

/* ── Light theme surfaces ─────────────────────────────────────── */
export const SURFACE            = '#f5f6ff'   // app background — cold blue-white
export const SURFACE_LOW        = '#edf0ff'   // secondary wells, list backgrounds
export const SURFACE_CONTAINER  = '#e0e8ff'   // grouping, interactive cards
export const SURFACE_HIGH       = '#d8e2ff'   // elevated interactive cards
export const SURFACE_LOWEST     = '#ffffff'   // pure white — top layer cards

/* ── Primary (Deep Academic Blue) ────────────────────────────── */
export const PRIMARY            = '#005da4'   // deep blue — CTAs, active states
export const PRIMARY_CONTAINER  = '#4fa4ff'   // sky blue — backgrounds, secondary CTA
export const PRIMARY_DIM        = '#3996f3'   // hover / pressed primary
export const ON_PRIMARY         = '#edf3ff'   // text on primary backgrounds

/* ── Secondary (Emerald — available, quiet, positive) ─────────── */
export const SECONDARY          = '#00694d'   // emerald — "available", positive
export const SECONDARY_CONTAINER = '#60fcc6'  // light mint bg
export const SECONDARY_DIM      = '#4eeeb9'   // secondary hover
export const ON_SECONDARY       = '#ffffff'

/* ── Tertiary (Amber — moderate / "buzzing") ──────────────────── */
export const TERTIARY           = '#6e5900'   // amber/gold — moderate occupancy
export const TERTIARY_CONTAINER = '#fcd43e'   // warm yellow bg
export const TERTIARY_DIM       = '#edc62f'

/* ── On-surface text ──────────────────────────────────────────── */
export const ON_SURFACE         = '#1c2e51'   // dark navy — primary text
export const ON_SURFACE_VARIANT = '#4a5b80'   // secondary text
export const OUTLINE            = '#65779d'   // borders, dividers
export const OUTLINE_VARIANT    = '#9badd7'   // subtle borders

/* ── Error / busy ─────────────────────────────────────────────── */
export const ERROR              = '#b31b25'
export const ERROR_CONTAINER    = '#fb5151'

/* ── Dark theme (Login only) ──────────────────────────────────── */
export const DARK_BG            = '#031425'   // deep navy background
export const DARK_SURFACE       = '#0f2131'   // dark container
export const DARK_SURFACE_HIGH  = '#1a2b3c'   // elevated dark surface
export const DARK_SURFACE_TOP   = '#253648'   // top dark layer
export const DARK_PRIMARY       = '#b7c8de'   // light steel blue
export const DARK_TEXT          = '#d2e4fb'   // pale blue text
export const DARK_MUTED         = '#c4c6cd'   // muted text

/* ── Legacy aliases (backward compat for unchanged components) ── */
export const CREME  = '#ffffff'
export const IVOIRE = SURFACE
export const MENTHE = SECONDARY_CONTAINER  // was mint, now soft emerald
export const EMER   = SECONDARY            // was teal, now true emerald
export const TURQ   = PRIMARY_DIM
export const AQUA   = SECONDARY_DIM
export const SAUGE  = PRIMARY
export const VERRE  = OUTLINE_VARIANT
export const MOUSSE = ON_SURFACE
export const FORET  = ON_SURFACE
export const MUTED  = ON_SURFACE_VARIANT
export const BORDER = OUTLINE_VARIANT
