import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('lang') || 'en'
  )

  function t(key, ...args) {
    const val = translations[lang]?.[key] ?? translations['fr']?.[key] ?? key
    return typeof val === 'function' ? val(...args) : val
  }

  function setLanguage(l) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
