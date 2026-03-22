import { useLanguage } from '../context/LanguageContext'

const SAGE        = '#6BA89A'   // vert sauge mat désaturé
const FOREST_DEEP = '#1C3A2E'  // vert profond mat

function IconExplore({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#9CA3AF'}
         strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconMap({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#9CA3AF'}
         strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

function IconProfile({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={active ? FOREST_DEEP : '#9CA3AF'}
         strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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
    <div
      className="absolute bottom-0 left-0 right-0 z-[1000] flex items-center justify-around px-4 pt-2 pb-5"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      {TABS.map(({ id, key, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-1.5 py-1 px-5"
          >
            {/* Petit cercle discret derrière l'icône active */}
            <div
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: 40, height: 40,
                background: isActive ? `rgba(107,168,154,0.12)` : 'transparent',
              }}
            >
              <Icon active={isActive} />
            </div>
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: isActive ? FOREST_DEEP : '#9CA3AF' }}
            >
              {t(key)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
