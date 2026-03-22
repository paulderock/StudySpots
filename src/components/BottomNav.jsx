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
    /* Academic bottom bar — glassmorphism, rounded top, no 1px border lines */
    <div
      className="absolute bottom-0 left-0 right-0 z-[1000]"
      style={{
        background: 'rgba(245,246,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(155,173,215,0.20)',
        borderRadius: '2rem 2rem 0 0',
        boxShadow: '0 -8px 32px rgba(28,46,81,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-6 pt-3 pb-5">
        {TABS.map(({ id, key, Icon }) => {
          const isActive = active === id
          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', damping: 22, stiffness: 380 }}
              className="flex flex-col items-center gap-1.5 relative px-5 py-2 rounded-full transition-colors"
              style={{
                background: isActive ? 'rgba(0,93,164,0.08)' : 'transparent',
                minWidth: 72,
              }}
            >
              <Icon active={isActive} />
              <span
                className="text-[10px] font-semibold tracking-wide leading-none"
                style={{ color: isActive ? '#005da4' : '#65779d' }}
              >
                {t(key)}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0 left-1/2 w-1 h-1 rounded-full -translate-x-1/2"
                  style={{ background: '#005da4' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
