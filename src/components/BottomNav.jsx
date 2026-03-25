import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

/* ── Icon SVGs (outline / filled) ────────────────────────────── */
function IconExplore({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={active ? '#005da4' : '#65779d'}
         strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
               fill={active ? '#005da4' : 'none'}
               stroke={active ? '#005da4' : '#65779d'}
               strokeWidth={active ? 2 : 1.8}/>
    </svg>
  )
}

function IconMap({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={active ? '#005da4' : '#65779d'}
         strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l6-3 5.553 2.276A1 1 0 0121 7.236v11.528a1 1 0 01-.553.894L15 22l-6-2z"/>
      <path d="M9 7v13M15 4v13"/>
    </svg>
  )
}

function IconProfile({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
         fill={active ? '#005da4' : 'none'}
         stroke={active ? '#005da4' : '#65779d'}
         strokeWidth={active ? 2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"
              fill={active ? '#005da4' : 'none'}
              stroke={active ? '#005da4' : '#65779d'}/>
    </svg>
  )
}

const TABS = [
  { id: 'explore', key: 'navExplore', Icon: IconExplore },
  { id: 'map',     key: 'navMap',     Icon: IconMap     },
  { id: 'profile', key: 'navProfile', Icon: IconProfile },
]

export default function BottomNav({ active, onChange }) {
  const { t } = useLanguage()

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[1000]"
      style={{
        background: 'transparent',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 10,
        display: 'flex',
        justifyContent: 'center',
        gap: 28,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {TABS.map(({ id, key, Icon }) => {
        const isActive = active === id
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.90 }}
            transition={{ type: 'spring', damping: 22, stiffness: 380 }}
            style={{
              pointerEvents: 'all',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {/* Floating circle */}
            <motion.div
              animate={{
                width:  isActive ? 58 : 52,
                height: isActive ? 58 : 52,
                boxShadow: isActive
                  ? '0 8px 24px rgba(0,93,164,0.18)'
                  : '0 4px 14px rgba(28,46,81,0.10)',
              }}
              transition={{ type: 'spring', damping: 24, stiffness: 360 }}
              style={{
                borderRadius: '50%',
                background: isActive ? 'rgba(245,246,255,0.97)' : 'rgba(245,246,255,0.90)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isActive
                  ? '1.5px solid rgba(0,93,164,0.15)'
                  : '1.5px solid rgba(155,173,215,0.25)',
              }}
            >
              <Icon active={isActive} />
            </motion.div>

            {/* Label */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                letterSpacing: '0.02em',
                color: isActive ? '#005da4' : '#65779d',
                lineHeight: 1,
              }}
            >
              {t(key)}
            </span>

            {/* Active dot */}
            {isActive && (
              <motion.div
                layoutId="nav-dot"
                style={{
                  width: 4, height: 4,
                  borderRadius: '50%',
                  background: '#005da4',
                  marginTop: -2,
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 400 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
