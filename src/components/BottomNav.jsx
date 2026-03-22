import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

const SAGE        = '#6BA89A'
const FOREST_DEEP = '#1C3A2E'

function IconExplore({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#94a3b8'}
         strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconMap({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#94a3b8'}
         strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

function IconProfile({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#94a3b8'}
         strokeWidth={active ? 2.2 : 1.8}
         strokeLinecap="round" strokeLinejoin="round">
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
    /* 3 ronds flottants indépendants — style Uber Eats */
    <div className="absolute bottom-7 left-0 right-0 z-[1000]
                    flex items-end justify-center gap-6">
      {TABS.map(({ id, key, Icon }) => {
        const isActive = active === id
        return (
          <div key={id} className="flex flex-col items-center gap-1.5">
            <motion.button
              onClick={() => onChange(id)}
              animate={{
                scale: isActive ? 1.08 : 1,
              }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', damping: 22, stiffness: 380 }}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive
                  ? `0 6px 20px rgba(28,58,46,0.18), 0 2px 6px rgba(0,0,0,0.10)`
                  : `0 4px 14px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)`,
                border: isActive
                  ? `1.5px solid rgba(107,168,154,0.40)`
                  : `1px solid rgba(0,0,0,0.07)`,
              }}
            >
              <Icon active={isActive} />
            </motion.button>

            {/* Label sous le rond */}
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: isActive ? FOREST_DEEP : '#9CA3AF' }}
            >
              {t(key)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
