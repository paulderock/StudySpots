import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

const MINT        = '#8AD1C2'
const FOREST_DEEP = '#153462'

function IconExplore({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"
         fill={active ? MINT : 'none'}
         stroke={active ? FOREST_DEEP : '#94a3b8'}
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconMap({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#94a3b8'}
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

function IconProfile({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#94a3b8'}
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
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
    <div className="absolute bottom-8 left-0 right-0 z-[1000] flex items-center justify-center gap-6">
      {TABS.map(({ id, key, Icon }) => {
        const isActive = active === id
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            className="flex items-center justify-center rounded-full"
            animate={{ width: isActive ? 52 : 46, height: isActive ? 52 : 46 }}
            transition={{ type: 'spring', damping: 24, stiffness: 380 }}
            style={isActive ? {
              background: '#fff',
              boxShadow: `0 6px 20px rgba(79,160,149,0.30), 0 2px 8px rgba(0,0,0,0.08)`,
              border: `1.5px solid rgba(138,209,194,0.45)`,
            } : {
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)',
              border: '1px solid rgba(226,232,240,0.6)',
            }}
          >
            <Icon active={isActive} />
          </motion.button>
        )
      })}
    </div>
  )
}
